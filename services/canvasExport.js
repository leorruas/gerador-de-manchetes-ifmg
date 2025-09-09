import * as constants from '../constants.js';

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y + (lineCount * lineHeight));
      line = words[n] + ' ';
      lineCount++;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y + (lineCount * lineHeight));
  return (lineCount + 1) * lineHeight;
}

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

export async function generateAndDownloadImage(
  format,
  baseImageElement,
  transform,
  headline,
  textVerticalPercent,
  slug,
  type
) {
  // Ensure the custom font is loaded before using it on the canvas
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
  
  // Calculate the center point of the original crop area
  let centerX = srcX + (srcWidth * transform.zoom / 2);
  let centerY = srcY + (srcHeight * transform.zoom / 2);

  // Apply panning offset relative to the original image dimensions
  let panX = transform.position.x * (baseImageElement.naturalWidth / format.width);
  let panY = transform.position.y * (baseImageElement.naturalHeight / format.height);

  // Adjust center based on panning
  centerX -= panX;
  centerY -= panY;

  // Recalculate srcX and srcY from the new center
  srcX = centerX - srcWidth / 2;
  srcY = centerY - srcHeight / 2;

  // Clamp values to stay within the bounds of the original image
  srcX = Math.max(0, Math.min(srcX, baseImageElement.naturalWidth - srcWidth));
  srcY = Math.max(0, Math.min(srcY, baseImageElement.naturalHeight - srcHeight));
  
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
    const textBoxWidth = format.width * 0.8759; // 946px for 1080 width
    const textBoxPadding = format.width * 0.0555; // 60px for 1080 width
    const boxX = (format.width - textBoxWidth) / 2;
    
    ctx.font = `bold ${format.width * 0.0463}px Archivo`; // 50px for 1080
    ctx.textBaseline = 'top';
    const lineHeight = format.width * 0.0555; // 60px for 1080

    const logoSize = format.width * 0.0926; // 100px for 1080
    const logoTextPadding = format.width * 0.0185; // 20px for 1080
    let textMaxWidth = textBoxWidth - (textBoxPadding * 2);
    if (format.hasLogo) {
        textMaxWidth -= (logoSize + logoTextPadding);
    }
    
    // --- Text Height Calculation ---
    const words = headline.split(' ');
    let line = '';
    let lineCount = 1;
    for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > textMaxWidth && line.length > 0) {
            lineCount++;
            line = word + ' ';
        } else {
            line = testLine;
        }
    }
    const textHeight = lineCount * lineHeight - (lineHeight - (format.width * 0.0463));
    // --- End Text Height Calculation ---
    
    const boxContentHeight = format.hasLogo ? Math.max(textHeight, logoSize) : textHeight;
    const boxHeight = boxContentHeight + textBoxPadding * 1.5;

    const safeAreaHeight = format.height - boxHeight;
    const boxY = (safeAreaHeight * textVerticalPercent);

    // Glass effect box
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
    wrapText(ctx, headline, textX, textY, textMaxWidth, lineHeight);
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