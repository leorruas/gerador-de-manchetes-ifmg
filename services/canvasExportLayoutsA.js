// Layouts de texto para templates de caixa de vidro e gradiente.
(() => {
const { drawSvgToCanvas, drawRoundedRect } = window.canvasExportHelpers;
const { TEMPLATE_TEXT } = window.layoutTokens;

async function drawGlassBox(ctx, data) {
    const { canvas, format, textContent, templateStyles, textBoxWidth, boxX, boxY, boxHeight, safeScale, padding, logoSize } = data;
        const glass = TEMPLATE_TEXT.glass;
        
        ctx.save();
        drawRoundedRect(ctx, boxX, boxY, textBoxWidth, boxHeight, safeScale * glass.radius);
        ctx.clip();
        try {
            ctx.filter = textContent.contrastBoost ? 'blur(24px) brightness(0.6)' : 'blur(12px)';
            ctx.drawImage(canvas, 0, 0);
        } catch (e) {
            console.warn("Filtro de canvas (blur) falhou. Pulando detalhe visual para evitar erro na exportação.", e);
        }
        ctx.restore();

        ctx.fillStyle = templateStyles.backgroundColor;
        drawRoundedRect(ctx, boxX, boxY, textBoxWidth, boxHeight, safeScale * glass.radius);
        ctx.fill();
        
        if (textContent.contrastBoost) {
             ctx.fillStyle = 'rgba(0,0,0,0.4)'; // Extra layer to ensure readability against bright pixels
             ctx.fill();
        }

        let currentX = boxX + padding;
        if (format.hasLogo) {
            await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, currentX, boxY + (boxHeight - logoSize)/2, logoSize, logoSize);
            currentX += logoSize + safeScale * glass.logoGap;
        }

        const textContainerWidth = boxX + textBoxWidth - padding - currentX;
        let currentY = boxY + padding;
        
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.font = `${safeScale * glass.eyebrowSize}px 'Archivo', sans-serif`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            
            // BUG-022: letterSpacing is experimental. Added defensive check.
            const spacing = safeScale * glass.eyebrowTrackingEm * glass.eyebrowSize;
            if (ctx.letterSpacing !== undefined) {
                ctx.letterSpacing = `${spacing}px`;
            }
            
            ctx.textBaseline = 'top';
            ctx.fillText(textContent.eyebrow.toUpperCase(), currentX, currentY);
            currentY += safeScale * glass.eyebrowLineHeight + safeScale * glass.eyebrowMarginBottom;
            
            if (ctx.letterSpacing !== undefined) {
                ctx.letterSpacing = "0px";
            }
        }

        if (textContent.headline) {
            ctx.font = `${safeScale * glass.headlineSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, `${safeScale * glass.headlineSize}px 'Archivo', sans-serif`, textContainerWidth);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * glass.headlineLineHeight, textContainerWidth, templateStyles.textColor);
            currentY += lines.length * safeScale * glass.headlineLineHeight;
        }

        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            currentY += safeScale * glass.subtitleMarginTop;
            ctx.font = `${safeScale * glass.subtitleSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * glass.subtitleSize}px 'Archivo', sans-serif`, textContainerWidth);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * glass.subtitleLineHeight, textContainerWidth, templateStyles.subtitleColor);
        }
        
}

async function drawGradient(ctx, data) {
    const { canvas, format, textContent, templateStyles, textBoxWidth, boxX, boxY, safeScale, padding } = data;
        const gradientToken = TEMPLATE_TEXT.gradient;
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
            const size = safeScale * gradientToken.logoSize;
            await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, currentX, currentY, size, size);
            currentY += size + safeScale * gradientToken.logoGap;
        }

        const textW = textBoxWidth - padding;

        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.font = `bold ${safeScale * gradientToken.eyebrowSize}px 'Archivo', sans-serif`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            
            const spacing = safeScale * gradientToken.eyebrowTrackingEm * gradientToken.eyebrowSize;
            if (ctx.letterSpacing !== undefined) {
                ctx.letterSpacing = `${spacing}px`;
            }

            ctx.textBaseline = 'top';
            ctx.fillText(textContent.eyebrow.toUpperCase(), currentX, currentY);
            currentY += safeScale * gradientToken.eyebrowLineHeight + safeScale * gradientToken.eyebrowMarginBottom;

            if (ctx.letterSpacing !== undefined) {
                ctx.letterSpacing = "0px";
            }
        }

        if (textContent.headline) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = safeScale * gradientToken.shadowBlur;
            ctx.shadowOffsetY = safeScale * gradientToken.shadowOffsetY;
            
            ctx.font = `bold ${safeScale * gradientToken.headlineSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, `bold ${safeScale * gradientToken.headlineSize}px 'Archivo', sans-serif`, textW);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * gradientToken.headlineLineHeight, textW, templateStyles.textColor, true);
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            currentY += lines.length * safeScale * gradientToken.headlineLineHeight;
        }

        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            currentY += safeScale * gradientToken.subtitleMarginTop;
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = safeScale * 8;
            ctx.shadowOffsetY = safeScale * 2;
            
            ctx.font = `${safeScale * gradientToken.subtitleSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * gradientToken.subtitleSize}px 'Archivo', sans-serif`, textW);
            window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * gradientToken.subtitleLineHeight, textW, templateStyles.subtitleColor);
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }
}

window.canvasExportLayouts = { ...(window.canvasExportLayouts || {}), drawGlassBox, drawGradient };
})();
