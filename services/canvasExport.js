import * as constants from '../constants.js';

/**
 * Calcula como o texto deve ser quebrado em várias linhas, respeitando
 * a largura máxima e as quebras de linha manuais (\n).
 * @param {CanvasRenderingContext2D} context - O contexto do canvas.
 * @param {string} text - O texto a ser processado.
 * @param {number} maxWidth - A largura máxima permitida para uma linha de texto.
 * @returns {string[]} Um array de strings, onde cada string é uma linha de texto.
 */
function getTextLines(context, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push(''); // Manter linhas vazias de parágrafos
      continue;
    }
    const words = paragraph.split(' ');
    let currentLine = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + ' ';
      if (context.measureText(testLine.trim()).width > maxWidth && i > 0) {
        lines.push(currentLine.trim());
        currentLine = words[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
    }
  }
  return lines;
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
    const textBoxPadding = format.width * 0.037; // 40px for 1080 width
    const boxX = (format.width - textBoxWidth) / 2;
    
    const fontSize = format.width * 0.0463; // 50px for 1080
    ctx.font = `bold ${fontSize}px Archivo`;
    ctx.textBaseline = 'top';
    const lineHeight = format.width * 0.0555; // 60px for 1080

    const logoSize = format.width * 0.13; // 140px for 1080
    const logoTextPadding = format.width * 0.0185; // 20px for 1080
    let textMaxWidth = textBoxWidth - (textBoxPadding * 2);
    if (format.hasLogo) {
        textMaxWidth -= (logoSize + logoTextPadding);
    }
    
    // --- Text Height Calculation ---
    const lines = getTextLines(ctx, headline, textMaxWidth);
    const lineCount = lines.length;
    const textHeight = lineCount > 0 ? ((lineCount - 1) * lineHeight) + fontSize : 0;
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
    lines.forEach((line, index) => {
        ctx.fillText(line, textX, textY + (index * lineHeight));
    });
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