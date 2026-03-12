(() => {
const constants = window.appConstants;
const { buildRichTextLines } = window.richTextService;


function getFilename(slug, format, type) {
  const date = new Date().toISOString().split('T')[0];
  const formatSlug = format.name.toLowerCase().replace(/\s/g, '-') + `-${format.width}x${format.height}`;
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
  return `${date}_ifmg_${cleanSlug || 'arte'}_${formatSlug}.${type}`;
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

async function generateAndDownloadImage(
  format,
  baseImageElement,
  transform,
  textContent,
  textVerticalPercent,
  slug,
  type
) {
  // Ensure the custom font is loaded before using it on the canvas
  await document.fonts.load('400 10px Archivo');
  await document.fonts.load('700 10px Archivo');

  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error("Could not get canvas context");
    return;
  }

  // Draw background image with transformations
  ctx.save();

  const containerAspectRatio = format.width / format.height;
  const imageAspectRatio = baseImageElement.naturalWidth / baseImageElement.naturalHeight;
  
  let srcWidth, srcHeight, srcX, srcY;

  if (containerAspectRatio > imageAspectRatio) {
    srcWidth = baseImageElement.naturalWidth;
    srcHeight = srcWidth / containerAspectRatio;
    srcX = 0;
    srcY = (baseImageElement.naturalHeight - srcHeight) / 2;
  } else {
    srcHeight = baseImageElement.naturalHeight;
    srcWidth = srcHeight * containerAspectRatio;
    srcY = 0;
    srcX = (baseImageElement.naturalWidth - srcWidth) / 2;
  }
  
  const invZoom = 1 / transform.zoom;
  srcWidth *= invZoom;
  srcHeight *= invZoom;

  const maxSrcX = Math.max(0, baseImageElement.naturalWidth - srcWidth);
  const maxSrcY = Math.max(0, baseImageElement.naturalHeight - srcHeight);
  const clampedPanX = Math.min(1, Math.max(-1, transform.position.x || 0));
  const clampedPanY = Math.min(1, Math.max(-1, transform.position.y || 0));
  srcX = maxSrcX > 0 ? ((clampedPanX + 1) / 2) * maxSrcX : 0;
  srcY = maxSrcY > 0 ? ((clampedPanY + 1) / 2) * maxSrcY : 0;
  
  ctx.clearRect(0, 0, format.width, format.height);
  ctx.drawImage(
    baseImageElement,
    srcX, srcY,
    srcWidth, srcHeight,
    0, 0,
    format.width, format.height
  );
  
  ctx.restore();

  if (format.hasText) {
    const eyebrow = textContent.eyebrow || '';
    const headline = textContent.headline || '';
    const subtitle = textContent.subtitle || '';
    const textBoxWidth = format.width * 0.8759; // 946px for 1080 width
    const textBoxPadding = format.width * 0.037; // 40px for 1080 width
    const boxX = (format.width - textBoxWidth) / 2;
    
    const eyebrowFontSize = format.width * 0.0167;
    const eyebrowLineHeight = format.width * 0.0222;
    const fontSize = format.width * 0.0463; // 50px for 1080
    ctx.textBaseline = 'top';
    const lineHeight = format.width * 0.0555; // 60px for 1080
    const subtitleFontSize = format.width * 0.0259;
    const subtitleLineHeight = format.width * 0.0333;
    const sectionGap = format.width * 0.0148;

    const logoSize = format.width * 0.13; // 140px for 1080
    const logoTextPadding = format.width * 0.0185; // 20px for 1080
    let textMaxWidth = textBoxWidth - (textBoxPadding * 2);
    if (format.hasLogo) {
        textMaxWidth -= (logoSize + logoTextPadding);
    }
    
    // --- Text Height Calculation ---
    const eyebrowLines = eyebrow ? [eyebrow.toUpperCase()] : [];
    const eyebrowHeight = eyebrowLines.length > 0 ? eyebrowFontSize : 0;
    const headlineLines = buildRichTextLines(ctx, headline, textMaxWidth, fontSize);
    const headlineLineCount = headlineLines.length;
    const headlineHeight = headlineLineCount > 0 ? ((headlineLineCount - 1) * lineHeight) + fontSize : 0;
    const subtitleLines = subtitle ? buildRichTextLines(ctx, subtitle, textMaxWidth, subtitleFontSize) : [];
    const subtitleLineCount = subtitleLines.length;
    const subtitleHeight = subtitleLineCount > 0 ? ((subtitleLineCount - 1) * subtitleLineHeight) + subtitleFontSize : 0;
    const textHeight = eyebrowHeight + headlineHeight + subtitleHeight
      + (eyebrowHeight && headlineHeight ? sectionGap : 0)
      + (subtitleHeight && headlineHeight ? sectionGap : 0);
    // --- End Text Height Calculation ---
    
    const boxContentHeight = format.hasLogo ? Math.max(textHeight, logoSize) : textHeight;
    const boxHeight = boxContentHeight + textBoxPadding * 2;

    const safeAreaHeight = format.height - boxHeight;
    const boxY = (safeAreaHeight * textVerticalPercent);

    // --- Start Glass Effect ---
    // 1. Save context state
    ctx.save();
    // 2. Create the rounded rectangle path and use it as a clipping mask
    drawRoundedRect(ctx, boxX, boxY, textBoxWidth, boxHeight, 24);
    ctx.clip();
    // 3. Apply a blur filter
    ctx.filter = 'blur(12px)';
    // 4. Draw the main canvas (the background image) back onto itself, but blurred and clipped
    ctx.drawImage(canvas, 0, 0);
    // 5. Restore the context to remove the filter and clipping mask
    ctx.restore();
    // --- End Glass Effect ---

    // Draw semi-transparent overlay on top of the blurred area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    drawRoundedRect(ctx, boxX, boxY, textBoxWidth, boxHeight, 24);
    ctx.fill();
    
    let textX = boxX + textBoxPadding;
    
    if (format.hasLogo) {
      const logoImage = new Image();
      const imageLoaded = new Promise(resolve => {
        logoImage.onload = resolve;
        logoImage.onerror = () => resolve(); // Don't block if logo fails
        logoImage.src = `data:image/svg+xml;base64,${btoa(constants.IFMG_LOGO_SVG_STRING)}`;
      });
      await imageLoaded;
      const logoX = boxX + textBoxPadding;
      const logoY = boxY + (boxHeight - logoSize) / 2;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      textX = logoX + logoSize + logoTextPadding;
    }

    // Draw text
    ctx.fillStyle = '#FFFFFF';
    const textY = boxY + (boxHeight - textHeight) / 2;
    let currentTextY = textY;

    if (eyebrowLines.length > 0) {
      ctx.font = `700 ${eyebrowFontSize}px Archivo`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      eyebrowLines.forEach((line) => {
        ctx.fillText(line, textX, currentTextY);
        currentTextY += eyebrowLineHeight;
      });
      currentTextY += headlineHeight > 0 ? sectionGap : 0;
    }

    ctx.fillStyle = '#FFFFFF';
    headlineLines.forEach((line, index) => {
        let currentX = textX;

        line.forEach((segment) => {
            ctx.font = `${segment.bold ? '700' : '400'} ${fontSize}px Archivo`;
            ctx.fillText(segment.text, currentX, currentTextY + (index * lineHeight));
            currentX += ctx.measureText(segment.text).width;
        });
    });

    if (headlineHeight > 0) {
      currentTextY += headlineHeight;
    }

    if (subtitleHeight > 0) {
      currentTextY += headlineHeight > 0 ? sectionGap : 0;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      subtitleLines.forEach((line, index) => {
        let currentX = textX;

        line.forEach((segment) => {
          ctx.font = `${segment.bold ? '700' : '400'} ${subtitleFontSize}px Archivo`;
          ctx.fillText(segment.text, currentX, currentTextY + (index * subtitleLineHeight));
          currentX += ctx.measureText(segment.text).width;
        });
      });
    }
  }

  // Trigger download
  const dataUrl = canvas.toDataURL(`image/${type}`, type === 'jpeg' ? 0.9 : 1.0);
  const link = document.createElement('a');
  link.download = getFilename(slug, format, type);
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.canvasExportService = {
  generateAndDownloadImage,
};
})();
