/**
 * Watermark engine main module
 * Coordinate watermark detection, alpha map calculation, and removal operations
 */

import { calculateAlphaMap } from './alphaMap.js';
import { removeWatermark } from './blendModes.js';
import { findWatermark, refineMatch } from './templateMatch.js';
import BG_48_PATH from '../assets/bg_48.png';
import BG_96_PATH from '../assets/bg_96.png';

/**
 * Detect watermark configuration based on image size
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {Object} Watermark configuration {logoSize, marginRight, marginBottom}
 */
export function detectWatermarkConfig(imageWidth, imageHeight) {
    // Gemini's watermark rules:
    // If both image width and height are greater than 1024, use 96×96 watermark
    // Otherwise, use 48×48 watermark
    if (imageWidth > 1024 && imageHeight > 1024) {
        return {
            logoSize: 96,
            marginRight: 64,
            marginBottom: 64
        };
    } else {
        return {
            logoSize: 48,
            marginRight: 32,
            marginBottom: 32
        };
    }
}

/**
 * Calculate watermark position in image based on image size and watermark configuration
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @param {Object} config - Watermark configuration {logoSize, marginRight, marginBottom}
 * @returns {Object} Watermark position {x, y, width, height}
 */
export function calculateWatermarkPosition(imageWidth, imageHeight, config) {
    const { logoSize, marginRight, marginBottom } = config;

    return {
        x: imageWidth - marginRight - logoSize,
        y: imageHeight - marginBottom - logoSize,
        width: logoSize,
        height: logoSize
    };
}

/**
 * Watermark engine class
 * Coordinate watermark detection, alpha map calculation, and removal operations
 */
export class WatermarkEngine {
    constructor(bgCaptures, templateDataMap) {
        this.bgCaptures = bgCaptures;
        this.templateDataMap = templateDataMap; // { 48: ImageData, 96: ImageData }
        this.alphaMaps = {};
    }

    static async create() {
        const bg48 = new Image();
        const bg96 = new Image();

        await Promise.all([
            new Promise((resolve, reject) => {
                bg48.onload = resolve;
                bg48.onerror = reject;
                bg48.src = BG_48_PATH;
            }),
            new Promise((resolve, reject) => {
                bg96.onload = resolve;
                bg96.onerror = reject;
                bg96.src = BG_96_PATH;
            })
        ]);

        // Pre-extract ImageData for template matching
        const templateDataMap = {};
        for (const [size, img] of [[48, bg48], [96, bg96]]) {
            const c = document.createElement('canvas');
            c.width = size;
            c.height = size;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            templateDataMap[size] = ctx.getImageData(0, 0, size, size);
        }

        return new WatermarkEngine({ bg48, bg96 }, templateDataMap);
    }

    /**
     * Get alpha map from background captured image based on watermark size
     * @param {number} size - Watermark size (48 or 96)
     * @returns {Promise<Float32Array>} Alpha map
     */
    async getAlphaMap(size) {
        // If cached, return directly
        if (this.alphaMaps[size]) {
            return this.alphaMaps[size];
        }

        // Select corresponding background capture based on watermark size
        const bgImage = size === 48 ? this.bgCaptures.bg48 : this.bgCaptures.bg96;

        // Create temporary canvas to extract ImageData
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, size, size);

        // Calculate alpha map
        const alphaMap = calculateAlphaMap(imageData);

        // Cache result
        this.alphaMaps[size] = alphaMap;

        return alphaMap;
    }

    /**
     * Detect watermark position(s) using template matching, with fallback to fixed position.
     * @param {ImageData} imageData - Full image data
     * @returns {{positions: Array<{x,y,width,height,score}>, logoSize: number, method: string}}
     */
    detectWatermarkPositions(imageData) {
        const config = detectWatermarkConfig(imageData.width, imageData.height);
        const primarySize = config.logoSize;
        const secondarySize = primarySize === 48 ? 96 : 48;

        // Try primary size first, then secondary
        for (const size of [primarySize, secondarySize]) {
            const tplData = this.templateDataMap[size];
            const sizeConfig = size === primarySize ? config : detectWatermarkConfig(imageData.width, imageData.height);
            const expectedPos = calculateWatermarkPosition(imageData.width, imageData.height, {
                logoSize: size,
                marginRight: size === 96 ? 64 : 32,
                marginBottom: size === 96 ? 64 : 32
            });

            const matches = findWatermark(imageData, tplData, expectedPos, {
                searchRadius: size,  // search within 1 watermark-width of expected position
                step: 2,
                threshold: 0.7
            });

            if (matches.length > 0) {
                const m = matches[0];
                const r = refineMatch(imageData, tplData, m.x, m.y, 4);
                return {
                    positions: [{ x: r.x, y: r.y, width: size, height: size, score: r.score }],
                    logoSize: size,
                    method: 'template'
                };
            }
        }

        // Fallback: use fixed position calculation
        const fallbackPos = calculateWatermarkPosition(imageData.width, imageData.height, config);
        return {
            positions: [{ ...fallbackPos, score: 0 }],
            logoSize: config.logoSize,
            method: 'fixed'
        };
    }

    /**
     * Remove watermark from image using template matching detection
     * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
     * @returns {Promise<HTMLCanvasElement>} Processed canvas
     */
    async removeWatermarkFromImage(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Detect watermark position(s) via template matching
        const detection = this.detectWatermarkPositions(imageData);
        const alphaMap = await this.getAlphaMap(detection.logoSize);

        // Remove watermark at each detected position
        for (const pos of detection.positions) {
            removeWatermark(imageData, alphaMap, pos);
        }

        ctx.putImageData(imageData, 0, 0);

        // Store last detection info for UI display
        this._lastDetection = detection;

        return canvas;
    }

    /**
     * Get watermark information (for display).
     * If template matching was just run, returns the detected info.
     * Otherwise falls back to the fixed-position estimate.
     *
     * @param {number} imageWidth - Image width
     * @param {number} imageHeight - Image height
     * @returns {Object} Watermark information
     */
    getWatermarkInfo(imageWidth, imageHeight) {
        // If we have fresh detection results, use them
        if (this._lastDetection) {
            const det = this._lastDetection;
            const primary = det.positions[0];
            return {
                size: det.logoSize,
                position: primary,
                config: detectWatermarkConfig(imageWidth, imageHeight),
                method: det.method,
                matchCount: det.positions.length,
                score: primary.score
            };
        }

        const config = detectWatermarkConfig(imageWidth, imageHeight);
        const position = calculateWatermarkPosition(imageWidth, imageHeight, config);

        return {
            size: config.logoSize,
            position: position,
            config: config,
            method: 'fixed',
            matchCount: 1,
            score: 0
        };
    }
}
