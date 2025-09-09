import { FormatConfig, ImageTransform, ExportType } from 'types.ts';
import { IFMG_CIRCLE_LOGO_SVG_STRING } from 'constants.tsx';
import React from 'react';

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
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


function getFilename(slug: string, format: FormatConfig, type: ExportType): string {
  const date = new Date().toISOString().split('T')[0];
  const formatSlug = format.name.toLowerCase().replace(/\s/g, '-') + `-${format.width}x${format.height}`;
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
  return `${date}_ifmg_${cleanSlug || 'arte'}_${formatSlug}.${type}`;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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
  format: FormatConfig,
  baseImageElement: HTMLImageElement,
  transform: ImageTransform,
  headline: string,
  textVerticalPercent: number,
  slug: string,
  type: ExportType,
) {
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
  ctx.drawImage(baseImageElement, 0, 0, baseImageElement.naturalWidth, baseImageElement.naturalHeight);

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
  srcX -= transform.position.x * (baseImageElement.naturalWidth / format.width) * invZoom;
  srcY -= transform.position.y * (baseImageElement.naturalHeight / format.height) * invZoom;

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
    const textBoxWidth = 946;
    const textBoxPadding = 60;
    const boxX = (format.width - textBoxWidth) / 2;
    
    ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    ctx.textBaseline = 'top';
    const lineHeight = 60;
    
    const logoSize = 100;
    const logoTextPadding = 20;
    let textMaxWidth = textBoxWidth - (textBoxPadding * 2);
    if(format.hasLogo){
        textMaxWidth -= (logoSize + logoTextPadding);
    }
    
    // Measure text height
    const tempWords = headline.split(' ');
    let tempLine = '';
    let lineCount = 1;
    for(const word of tempWords) {
        const testLine = tempLine + word + ' ';
        if (ctx.measureText(testLine).width > textMaxWidth && tempLine.length > 0) {
            lineCount++;
            tempLine = word + ' ';
        } else {
            tempLine = testLine;
        }
    }
    const textHeight = lineCount * lineHeight - (lineHeight - 50);
    
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
        logoImage.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(IFMG_CIRCLE_LOGO_SVG_STRING)))}`;
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