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
    const templateStyles = constants.TEMPLATES[textContent.templateId || constants.TEMPLATE_ID.NEWS];
    
    const textBoxWidth = format.width * 0.8759;
    const boxX = (format.width - textBoxWidth) / 2;
    // Calculate global scaling based on original 1080px base
    const safeScale = format.width / 1080;
    const padding = safeScale * 40;

    // --- Box Height & Positioning Setup ---
    let textHeight = 0;
    let boxContentHeight = 0;
    const logoSize = safeScale * 140;

    // Roughly estimate text heights for standard glassbox to calculate the dragging box.
    // For other templates, the drag box is still used as a vertical anchor anchor.
    const eyebrowHeight = (textContent.showEyebrowInput !== false && textContent.eyebrow) ? safeScale * 24 + safeScale * 8 : 0;
    const headlineLines = textContent.headline ? window.richTextService.parseRichTextToLines(ctx, textContent.headline, `${safeScale * 50}px Archivo`, textBoxWidth - padding*2 - (format.hasLogo ? logoSize + safeScale*20 : 0)) : [];
    const headlineHeight = headlineLines.length * safeScale * 60;
    const subtitleLines = (textContent.showSubtitleInput !== false && textContent.subtitle) ? window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * 28}px Archivo`, textBoxWidth - padding*2 - (format.hasLogo ? logoSize + safeScale*20 : 0)) : [];
    const subtitleHeight = subtitleLines.length > 0 ? (subtitleLines.length * safeScale * 36) + safeScale * 12 : 0;

    textHeight = eyebrowHeight + headlineHeight + subtitleHeight;
    boxContentHeight = format.hasLogo ? Math.max(textHeight, logoSize) : textHeight;
    const boxHeight = boxContentHeight + padding * 2;

    const safeAreaMarginPercent = 0.05; 
    const marginPx = format.height * safeAreaMarginPercent;
    const absoluteMinTop = marginPx;
    const absoluteMaxTop = format.height - boxHeight - marginPx;
    const usableMinTop = Math.min(absoluteMinTop, absoluteMaxTop < absoluteMinTop ? 0 : absoluteMinTop);
    const usableMaxTop = Math.max(absoluteMaxTop, absoluteMaxTop < absoluteMinTop ? format.height - boxHeight : absoluteMaxTop);

    const range = usableMaxTop - usableMinTop;
    const boxY = range > 0 ? usableMinTop + (textVerticalPercent * range) : usableMinTop;
      
    // --- Layout Drawing Engine ---

    if (templateStyles.layoutType === constants.LAYOUT_TYPE.GLASS_BOX) {
        
        ctx.save();
        drawRoundedRect(ctx, boxX, boxY, textBoxWidth, boxHeight, safeScale * 24);
        ctx.clip();
        ctx.filter = textContent.contrastBoost ? 'blur(24px) brightness(0.6)' : 'blur(12px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();

        ctx.fillStyle = templateStyles.backgroundColor;
        drawRoundedRect(ctx, boxX, boxY, textBoxWidth, boxHeight, safeScale * 24);
        ctx.fill();
        
        if (textContent.contrastBoost) {
             ctx.fillStyle = 'rgba(0,0,0,0.4)'; // Extra layer to ensure readability against bright pixels
             ctx.fill();
        }

        let currentX = boxX + padding;
        if (format.hasLogo) {
            await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, currentX, boxY + (boxHeight - logoSize)/2, logoSize, logoSize);
            currentX += logoSize + safeScale * 20;
        }

        const textContainerWidth = boxX + textBoxWidth - padding - currentX;
        let currentY = boxY + padding;

        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.font = `${safeScale * 18}px Archivo`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            ctx.letterSpacing = `${safeScale * 0.18 * 18}px`; 
            ctx.textBaseline = 'top';
            ctx.fillText(textContent.eyebrow.toUpperCase(), currentX, currentY);
            currentY += safeScale * 24 + safeScale * 8;
            ctx.letterSpacing = "0px";
        }

        if (textContent.headline) {
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, `${safeScale * 50}px Archivo`, textContainerWidth);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * 60, textContainerWidth, templateStyles.textColor);
            currentY += lines.length * safeScale * 60;
        }

        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            currentY += safeScale * 12;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * 28}px Archivo`, textContainerWidth);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * 36, textContainerWidth, templateStyles.subtitleColor);
        }
        
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.GRADIENT) {
        
        const gradientStartY = Math.max(0, boxY - safeScale * 150);
        const gradient = ctx.createLinearGradient(0, gradientStartY, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(Math.min(1, (safeScale * 300) / (canvas.height - gradientStartY || 1)), 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, gradientStartY, canvas.width, canvas.height - gradientStartY);
        
        let currentX = boxX + padding/2;
        let currentY = boxY + padding/2;

        if (format.hasLogo) {
            const size = safeScale * 100;
            await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, currentX, currentY, size, size);
            currentY += size + safeScale * 20;
        }

        const textW = textBoxWidth - padding;

        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.font = `bold ${safeScale * 20}px Archivo`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            ctx.letterSpacing = `${safeScale * 0.2 * 20}px`; 
            ctx.textBaseline = 'top';
            ctx.fillText(textContent.eyebrow.toUpperCase(), currentX, currentY);
            currentY += safeScale * 26 + safeScale * 12;
            ctx.letterSpacing = "0px";
        }

        if (textContent.headline) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = safeScale * 12;
            ctx.shadowOffsetY = safeScale * 4;
            
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, `bold ${safeScale * 65}px Archivo`, textW);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * 75, textW, templateStyles.textColor, true);
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            currentY += lines.length * safeScale * 75;
        }

        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            currentY += safeScale * 16;
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = safeScale * 8;
            ctx.shadowOffsetY = safeScale * 2;
            
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * 32}px Archivo`, textW);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * 42, textW, templateStyles.subtitleColor);
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }
        
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.QUOTE) {
        
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let currentY = boxY + padding;
        const textW = textBoxWidth - padding*2;
        const centerX = boxX + textBoxWidth / 2;
        
        const quoteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${templateStyles.eyebrowColor}"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>`;
        const quoteSize = safeScale * 80;
        
        ctx.globalAlpha = 0.8;
        await drawSvgToCanvas(ctx, quoteSvg, centerX - quoteSize/2, currentY, quoteSize, quoteSize);
        ctx.globalAlpha = 1.0;
        
        currentY += quoteSize + safeScale * 16;
        
        if (textContent.headline) {
            const quoteText = textContent.headline;
            const lines = window.richTextService.parseRichTextToLines(ctx, quoteText, `italic bold ${safeScale * 45}px Archivo`, textW);
            const lineHeight = safeScale * 55;
            
            for (const line of lines) {
                const lineWidth = measureLineWidth(ctx, line);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [line], startX, currentY, lineHeight, textW, templateStyles.textColor, true);
                currentY += lineHeight;
            }
        }
        
        currentY += safeScale * 24;
        ctx.fillStyle = templateStyles.eyebrowColor;
        ctx.fillRect(centerX - (safeScale * 64)/2, currentY, safeScale * 64, safeScale * 4);
        currentY += safeScale * 4 + safeScale * 16;
        
        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.font = `bold ${safeScale * 22}px Archivo`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            ctx.letterSpacing = `${safeScale * 0.1 * 22}px`; 
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.fillText(textContent.eyebrow.toUpperCase(), centerX, currentY);
            ctx.textAlign = 'left';
            ctx.letterSpacing = "0px";
            currentY += safeScale * 28 + safeScale * 8; 
        }
        
        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * 24}px Archivo`, textW);
            const subLineHeight = safeScale * 32;
            for (const line of lines) {
                const lineWidth = measureLineWidth(ctx, line);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [line], startX, currentY, subLineHeight, textW, templateStyles.subtitleColor);
                currentY += subLineHeight;
            }
        }
        
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.INFOGRAPHIC) {
        
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let currentY = boxY + padding;
        const textW = textBoxWidth - padding*2;
        const centerX = boxX + textBoxWidth / 2;

        if (format.hasLogo) {
            const logoSize = safeScale * 100;
            await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, centerX - logoSize/2, currentY, logoSize, logoSize);
            currentY += logoSize + safeScale * 20;
        }
        
        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = safeScale * 12;
            ctx.shadowOffsetY = safeScale * 4;
            
            ctx.font = `bold ${safeScale * 140}px Archivo`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.fillText(textContent.eyebrow, centerX, currentY);
            ctx.textAlign = 'left';
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            currentY += safeScale * 140 + safeScale * 8;
        }

        if (textContent.headline) {
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, `bold ${safeScale * 35}px Archivo`, textW);
            const lineHeight = safeScale * 42;
            
            for (const line of lines) {
                const upperText = line.map(span => ({...span, text: span.text.toUpperCase()}));
                const lineWidth = measureLineWidth(ctx, upperText);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [upperText], startX, currentY, lineHeight, textW, templateStyles.textColor, true);
                currentY += lineHeight;
            }
        }

        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            currentY += safeScale * 16;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * 26}px Archivo`, textW);
            const subLineHeight = safeScale * 34;
            const paddingX = safeScale * 16;
            const paddingY = safeScale * 8;
            
            const totalSubHeight = lines.length * subLineHeight;
            let maxWidth = 0;
            for (const line of lines) {
                maxWidth = Math.max(maxWidth, measureLineWidth(ctx, line));
            }
            
            const subBgX = centerX - maxWidth/2 - paddingX;
            const subBgY = currentY - paddingY;
            const subBgW = maxWidth + paddingX*2;
            const subBgH = totalSubHeight + paddingY*2;
            
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            drawRoundedRect(ctx, subBgX, subBgY, subBgW, subBgH, safeScale * 20);
            ctx.fill();
            
            let ySub = currentY;
            for (const line of lines) {
                const lineWidth = measureLineWidth(ctx, line);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [line], startX, ySub, subLineHeight, textW, templateStyles.subtitleColor);
                ySub += subLineHeight;
            }
        }
    }
  }

  // Trigger download via Blob to check file size
  const quality = type === 'jpeg' ? 0.9 : 1.0;
  
  canvas.toBlob((blob) => {
    if (!blob) {
       console.error("Falha ao gerar o arquivo de imagem final.");
       return;
    }
    
    // Size Check in Megabytes
    const sizeMB = blob.size / (1024 * 1024);
    
    if (sizeMB > 1.5) {
        const proceed = window.confirm(`ATENÇÃO: A arte "${format.name}" gerou um arquivo muito pesado (${sizeMB.toFixed(2)} MB).\n\nArquivos grandes podem deixar o portal lento e prejudicar o carregamento no celular.\n\nDeseja baixar mesmo assim?`);
        if (!proceed) {
             console.log("Exportação cancelada devido ao tamanho do arquivo.");
             return;
        }
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = getFilename(slug, format, type);
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    
  }, `image/${type}`, quality);
}

window.canvasExportService = {
  generateAndDownloadImage,
};
})();
