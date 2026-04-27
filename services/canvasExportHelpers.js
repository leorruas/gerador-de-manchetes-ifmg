// Helpers pequenos para nome de arquivo, SVG no canvas e medidas de texto.
(() => {
function getFilename(slug, format, type) {
  const date = new Date().toISOString().split('T')[0];
  const formatSlug = format.name.toLowerCase().replace(/\s/g, '-') + `-${format.width}x${format.height}`;
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
  return `${date}_ifmg_${cleanSlug || 'arte'}_${formatSlug}.${type}`;
}

function drawSvgToCanvas(ctx, svgString, x, y, width, height) {
    return new Promise((resolve, reject) => {
        const DOMURL = window.URL || window.webkitURL || window;
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = DOMURL.createObjectURL(svg);
        const img = new Image();
        
        img.onload = function() {
            ctx.drawImage(img, x, y, width, height);
            DOMURL.revokeObjectURL(url);
            resolve();
        };
        img.onerror = function(err) {
            reject(err);
        };
        img.src = url;
    });
}

function measureLineWidth(ctx, line) {
    let width = 0;
    const baseFont = ctx.font;
    line.forEach(segment => {
        let targetFont = baseFont;
        if (segment.bold || segment.highlight) {
            if (!targetFont.includes('bold')) targetFont = 'bold ' + targetFont;
        }
        if (segment.italic) {
            if (!targetFont.includes('italic')) targetFont = 'italic ' + targetFont;
        }
        ctx.font = targetFont;
        width += ctx.measureText(segment.text).width;
    });
    ctx.font = baseFont;
    return width;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
window.canvasExportHelpers = { getFilename, drawSvgToCanvas, measureLineWidth, drawRoundedRect };
})();

