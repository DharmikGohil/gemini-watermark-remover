/**
 * Template matching module
 * Scans image regions to find where the watermark pattern actually appears,
 * instead of relying on fixed position assumptions.
 */

/**
 * Compute normalized cross-correlation (NCC) between a template and an image patch.
 * Returns a score between -1 and 1, where 1 = perfect match.
 *
 * @param {Uint8ClampedArray} imgData - Full image pixel data (RGBA)
 * @param {number} imgW - Image width
 * @param {number} patchX - Top-left X of the patch in the image
 * @param {number} patchY - Top-left Y of the patch in the image
 * @param {Uint8ClampedArray} tplData - Template pixel data (RGBA)
 * @param {number} tplW - Template width
 * @param {number} tplH - Template height
 * @returns {number} NCC score
 */
function ncc(imgData, imgW, patchX, patchY, tplData, tplW, tplH) {
    let sumImg = 0, sumTpl = 0, count = 0;

    // First pass: compute means (grayscale luminance)
    for (let r = 0; r < tplH; r++) {
        for (let c = 0; c < tplW; c++) {
            const ii = ((patchY + r) * imgW + (patchX + c)) * 4;
            const ti = (r * tplW + c) * 4;
            // Use luminance approximation
            const imgGray = imgData[ii] * 0.299 + imgData[ii + 1] * 0.587 + imgData[ii + 2] * 0.114;
            const tplGray = tplData[ti] * 0.299 + tplData[ti + 1] * 0.587 + tplData[ti + 2] * 0.114;
            sumImg += imgGray;
            sumTpl += tplGray;
            count++;
        }
    }

    const meanImg = sumImg / count;
    const meanTpl = sumTpl / count;

    // Second pass: compute NCC
    let num = 0, denImg = 0, denTpl = 0;
    for (let r = 0; r < tplH; r++) {
        for (let c = 0; c < tplW; c++) {
            const ii = ((patchY + r) * imgW + (patchX + c)) * 4;
            const ti = (r * tplW + c) * 4;
            const imgGray = imgData[ii] * 0.299 + imgData[ii + 1] * 0.587 + imgData[ii + 2] * 0.114;
            const tplGray = tplData[ti] * 0.299 + tplData[ti + 1] * 0.587 + tplData[ti + 2] * 0.114;

            const dImg = imgGray - meanImg;
            const dTpl = tplGray - meanTpl;
            num += dImg * dTpl;
            denImg += dImg * dImg;
            denTpl += dTpl * dTpl;
        }
    }

    const den = Math.sqrt(denImg * denTpl);
    if (den < 1e-6) return 0;
    return num / den;
}


/**
 * Search for the watermark template strictly in the bottom-right corner of an image.
 * The Gemini watermark is always placed in the corner, so we only scan a tight
 * region around the expected position to avoid false positives.
 *
 * @param {ImageData} imageData - The full image data
 * @param {ImageData} templateData - The watermark template image data
 * @param {Object} expectedPos - Expected position from fixed calculation {x, y}
 * @param {Object} options
 * @param {number} [options.searchRadius=48] - Pixels around expected position to scan
 * @param {number} [options.step=2] - Pixel step for scanning
 * @param {number} [options.threshold=0.7] - Minimum NCC score to consider a match
 * @returns {Array<{x: number, y: number, score: number}>} Detected watermark positions (0 or 1 result)
 */
export function findWatermark(imageData, templateData, expectedPos, options = {}) {
    const {
        searchRadius = 48,
        step = 2,
        threshold = 0.7
    } = options;

    const imgW = imageData.width;
    const imgH = imageData.height;
    const tplW = templateData.width;
    const tplH = templateData.height;
    const imgData = imageData.data;
    const tplData = templateData.data;

    // Only scan a tight box around the expected watermark position
    const x0 = Math.max(0, expectedPos.x - searchRadius);
    const y0 = Math.max(0, expectedPos.y - searchRadius);
    const x1 = Math.min(imgW - tplW, expectedPos.x + searchRadius);
    const y1 = Math.min(imgH - tplH, expectedPos.y + searchRadius);

    let bestMatch = null;

    for (let y = y0; y <= y1; y += step) {
        for (let x = x0; x <= x1; x += step) {
            const score = ncc(imgData, imgW, x, y, tplData, tplW, tplH);
            if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { x, y, score };
            }
        }
    }

    return bestMatch ? [bestMatch] : [];
}

/**
 * Refine a coarse match position to sub-pixel accuracy by scanning
 * a small neighborhood at step=1.
 *
 * @param {ImageData} imageData
 * @param {ImageData} templateData
 * @param {number} coarseX
 * @param {number} coarseY
 * @param {number} radius - Pixels around coarse position to search
 * @returns {{x: number, y: number, score: number}}
 */
export function refineMatch(imageData, templateData, coarseX, coarseY, radius = 4) {
    const imgW = imageData.width;
    const imgH = imageData.height;
    const tplW = templateData.width;
    const tplH = templateData.height;

    let bestX = coarseX, bestY = coarseY, bestScore = -1;

    const x0 = Math.max(0, coarseX - radius);
    const y0 = Math.max(0, coarseY - radius);
    const x1 = Math.min(imgW - tplW, coarseX + radius);
    const y1 = Math.min(imgH - tplH, coarseY + radius);

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            const score = ncc(imageData.data, imgW, x, y, templateData.data, tplW, tplH);
            if (score > bestScore) {
                bestScore = score;
                bestX = x;
                bestY = y;
            }
        }
    }

    return { x: bestX, y: bestY, score: bestScore };
}
