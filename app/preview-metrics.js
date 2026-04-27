// Calculos de enquadramento compartilhados pelo preview HTML e pelo drag de crop.
(() => {
const { constants, state, clamp } = window.mancheteApp;

function getPreviewImageMetrics(format, transform = state.transforms[format.id]) {
    const image = state.baseImageElement;
    if (!image?.naturalWidth || !image?.naturalHeight) return null;

    const containerAspect = format.width / format.height;
    const imageAspect = image.naturalWidth / image.naturalHeight;

    const fitMode = transform.fitMode || 'cover';
    const zoom = transform.zoom || 1;
    const containScale = 0.90; // 5% margins around
    
    let baseWidthPercent = 100;
    let baseHeightPercent = 100;

    if (fitMode === 'contain') {
        if (imageAspect > containerAspect) {
            baseWidthPercent = 100 * containScale;
            baseHeightPercent = (containerAspect / imageAspect) * 100 * containScale;
        } else {
            baseHeightPercent = 100 * containScale;
            baseWidthPercent = (imageAspect / containerAspect) * 100 * containScale;
        }
    } else {
        if (imageAspect > containerAspect) {
            baseWidthPercent = (imageAspect / containerAspect) * 100;
            baseHeightPercent = 100;
        } else {
            baseHeightPercent = (containerAspect / imageAspect) * 100;
            baseWidthPercent = 100;
        }
    }

    const widthPercent = baseWidthPercent * zoom;
    const heightPercent = baseHeightPercent * zoom;

    const overflowXPercent = Math.max(0, widthPercent - 100);
    const overflowYPercent = Math.max(0, heightPercent - 100);
    const underflowXPercent = Math.max(0, 100 - widthPercent);
    const underflowYPercent = Math.max(0, 100 - heightPercent);

    const x = clamp(transform.position.x || 0, -1, 1);
    const y = clamp(transform.position.y || 0, -1, 1);

    let leftPercent, topPercent;

    if (widthPercent > 100) {
        leftPercent = -overflowXPercent / 2 - (x * overflowXPercent / 2);
    } else {
        leftPercent = underflowXPercent / 2 + (x * underflowXPercent / 2);
    }
    
    if (heightPercent > 100) {
        topPercent = -overflowYPercent / 2 - (y * overflowYPercent / 2);
    } else {
        topPercent = underflowYPercent / 2 + (y * underflowYPercent / 2);
    }

    return {
        widthPercent,
        heightPercent,
        leftPercent,
        topPercent,
        overflowXPercent,
        overflowYPercent,
        underflowXPercent,
        underflowYPercent
    };
}

function applyPreviewImageStyles(formatId) {
    const format = constants.FORMATS[formatId];
    const img = document.getElementById(`preview-image-${formatId}`);
    if (!format || !img) return;

    const metrics = getPreviewImageMetrics(format, state.transforms[formatId]);
    if (!metrics) return;

    img.style.width = `${metrics.widthPercent}%`;
    img.style.height = `${metrics.heightPercent}%`;
    img.style.left = `${metrics.leftPercent}%`;
    img.style.top = `${metrics.topPercent}%`;
}

function updateCropPreview(formatId) {
    applyPreviewImageStyles(formatId);
    requestAnimationFrame(() => applyPreviewImageStyles(formatId));
}
Object.assign(window.mancheteApp, {
  getPreviewImageMetrics,
  applyPreviewImageStyles,
  updateCropPreview,
});
})();
