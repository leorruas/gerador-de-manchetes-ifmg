// Layouts de texto para templates de citacao e numero destaque.
(() => {
const { drawSvgToCanvas, measureLineWidth, drawRoundedRect } = window.canvasExportHelpers;
const { TEMPLATE_TEXT } = window.layoutTokens;

async function drawQuote(ctx, data) {
    const { canvas, format, textContent, templateStyles, textBoxWidth, boxX, boxY, safeScale, padding } = data;
        const quote = TEMPLATE_TEXT.quote;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let currentY = boxY + safeScale * quote.padding;
        const textW = textBoxWidth - (safeScale * quote.padding * 2);
        const centerX = boxX + textBoxWidth / 2;
        
        const quoteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${templateStyles.eyebrowColor}"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>`;
        const quoteSize = safeScale * quote.iconSize;
        
        ctx.globalAlpha = 0.8;
        await drawSvgToCanvas(ctx, quoteSvg, centerX - quoteSize/2, currentY, quoteSize, quoteSize);
        ctx.globalAlpha = 1.0;
        
        currentY += quoteSize + safeScale * quote.iconGap;
        
        if (textContent.headline) {
            const quoteText = textContent.headline;
            ctx.font = `italic bold ${safeScale * quote.headlineSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, quoteText, ctx.font, textW);
            const lineHeight = safeScale * quote.headlineLineHeight;
            
            for (const line of lines) {
                const lineWidth = measureLineWidth(ctx, line);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [line], startX, currentY, lineHeight, textW, templateStyles.textColor, true);
                currentY += lineHeight;
            }
        }
        
        currentY += safeScale * quote.dividerMarginTop;
        ctx.fillStyle = templateStyles.eyebrowColor;
        ctx.fillRect(centerX - (safeScale * quote.dividerWidth)/2, currentY, safeScale * quote.dividerWidth, safeScale * quote.dividerHeight);
        currentY += safeScale * quote.dividerHeight + safeScale * quote.dividerMarginBottom;
        
        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.font = `bold ${safeScale * quote.eyebrowSize}px 'Archivo', sans-serif`;
            ctx.fillStyle = templateStyles.eyebrowColor;
            
            const spacing = safeScale * quote.eyebrowTrackingEm * quote.eyebrowSize;
            if (ctx.letterSpacing !== undefined) {
                ctx.letterSpacing = `${spacing}px`;
            }

            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.fillText(textContent.eyebrow.toUpperCase(), centerX, currentY);
            ctx.textAlign = 'left';
            
            if (ctx.letterSpacing !== undefined) {
                ctx.letterSpacing = "0px";
            }
            currentY += safeScale * quote.eyebrowLineHeight + safeScale * quote.eyebrowMarginBottom; 
        }
        
        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            ctx.font = `${safeScale * quote.subtitleSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, ctx.font, textW);
            const subLineHeight = safeScale * quote.subtitleLineHeight;
            for (const line of lines) {
                const lineWidth = measureLineWidth(ctx, line);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [line], startX, currentY, subLineHeight, textW, templateStyles.subtitleColor);
                currentY += subLineHeight;
            }
        }
}

async function drawInfographic(ctx, data) {
    const { canvas, format, textContent, templateStyles, textBoxWidth, boxX, boxY, safeScale, padding } = data;
        const infographic = TEMPLATE_TEXT.infographic;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let currentY = boxY + safeScale * infographic.padding;
        const textW = textBoxWidth - (safeScale * infographic.padding * 2);
        const centerX = boxX + textBoxWidth / 2;

        if (format.hasLogo) {
            const logoSize = safeScale * infographic.logoSize;
            await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, centerX - logoSize/2, currentY, logoSize, logoSize);
            currentY += logoSize + safeScale * infographic.logoGap;
        }
        
        if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = safeScale * infographic.shadowBlur;
            ctx.shadowOffsetY = safeScale * infographic.shadowOffsetY;
            
            ctx.font = `bold ${safeScale * infographic.eyebrowSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.eyebrow, ctx.font, textW);
            const lineHeight = safeScale * infographic.eyebrowLineHeight;

            for (const line of lines) {
                const lineWidth = measureLineWidth(ctx, line);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [line], startX, currentY, lineHeight, textW, templateStyles.eyebrowColor);
                currentY += lineHeight;
            }
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            currentY += safeScale * infographic.eyebrowMarginBottom;
        }

        if (textContent.headline) {
            ctx.font = `bold ${safeScale * infographic.headlineSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, ctx.font, textW);
            const lineHeight = safeScale * infographic.headlineLineHeight;
            
            for (const line of lines) {
                const upperText = line.map(span => ({...span, text: span.text.toUpperCase()}));
                const lineWidth = measureLineWidth(ctx, upperText);
                const startX = centerX - lineWidth / 2;
                window.richTextService.drawRichTextLines(ctx, [upperText], startX, currentY, lineHeight, textW, templateStyles.textColor, true);
                currentY += lineHeight;
            }
        }

        if (textContent.showSubtitleInput !== false && textContent.subtitle) {
            currentY += safeScale * infographic.subtitleMarginTop;
            ctx.font = `${safeScale * infographic.subtitleSize}px 'Archivo', sans-serif`;
            const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, ctx.font, textW);
            const subLineHeight = safeScale * infographic.subtitleLineHeight;
            const paddingX = safeScale * infographic.subtitlePaddingX;
            const paddingY = safeScale * infographic.subtitlePaddingY;
            
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
            drawRoundedRect(ctx, subBgX, subBgY, subBgW, subBgH, safeScale * infographic.subtitleRadius);
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

window.canvasExportLayouts = { ...(window.canvasExportLayouts || {}), drawQuote, drawInfographic };
})();
