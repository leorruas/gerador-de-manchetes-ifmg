// Layout de exportacao do template de carrossel "Historia Completa".
(() => {
const { drawSvgToCanvas } = window.canvasExportHelpers;
const { TEMPLATE_TEXT } = window.layoutTokens;

async function drawCarouselStory(ctx, data) {
    const { canvas, format, textContent, templateStyles, textBoxWidth, boxX, boxY, safeScale, padding } = data;
    const gradientToken = TEMPLATE_TEXT.gradient;
    const { slideIndex, totalSlides, storyLayoutMode, storyColor1, storyColor2 } = textContent;
    const isFirstSlide = slideIndex <= 0;
    const isLastSlide = slideIndex === totalSlides - 1 || totalSlides === 1;
    const storyColor = slideIndex % 2 === 1 ? storyColor2 : storyColor1;
    const storyBgColor = slideIndex % 2 === 1 ? storyColor1 : storyColor2;
    const headlineSizeFactor = isFirstSlide ? 1.3 : 0.85;
    const headlineLHFactor = isFirstSlide ? 1.15 : 0.85;
    const logoSizeFactor = (format.hasLogo && isLastSlide) ? 2.2 : 0;
    const actualLogoH = logoSizeFactor > 0 ? safeScale * gradientToken.logoSize * logoSizeFactor + safeScale * gradientToken.logoGap : 0;
    const actualEyebrowH = (textContent.showEyebrowInput !== false && textContent.eyebrow) ? safeScale * gradientToken.eyebrowLineHeight + safeScale * gradientToken.eyebrowMarginBottom : 0;
    const actualHeadlineSize = safeScale * gradientToken.headlineSize * headlineSizeFactor;
    const actualHeadlineLH = safeScale * gradientToken.headlineLineHeight * headlineLHFactor;
    ctx.font = `bold ${actualHeadlineSize}px 'Montagu Slab', serif`;
    const textW = textBoxWidth - padding;
    const headlineLines = textContent.headline ? window.richTextService.parseRichTextToLines(ctx, textContent.headline, ctx.font, textW) : [];
    const actualHeadlineH = headlineLines.length * actualHeadlineLH;
    const actualSubH = (textContent.showSubtitleInput !== false && textContent.subtitle) ? safeScale * gradientToken.subtitleMarginTop + safeScale * gradientToken.subtitleLineHeight * 2 : 0;
    const totalContentH = actualLogoH + actualEyebrowH + actualHeadlineH + actualSubH + padding;
    const adjustedBoxY = Math.min(boxY, canvas.height - totalContentH - safeScale * 40);

    if (storyLayoutMode === 'solid_color') {
        ctx.fillStyle = storyBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (storyLayoutMode === 'gradient_bottom') {
        const gradientStartY = Math.max(0, adjustedBoxY - safeScale * 150);
        const gradient = ctx.createLinearGradient(0, gradientStartY, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(Math.min(1, (safeScale * 300) / (canvas.height - gradientStartY || 1)), 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, gradientStartY, canvas.width, canvas.height - gradientStartY);
    } else if (storyLayoutMode === 'gradient_top') {
        const midY = canvas.height * 0.5;
        const gradient = ctx.createLinearGradient(0, 0, 0, midY);
        gradient.addColorStop(0, 'rgba(0,0,0,0.95)');
        gradient.addColorStop(0.6, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, midY);
    }

    let currentX = boxX + padding / 2;
    let currentY = adjustedBoxY + padding / 2;
    if (format.hasLogo && isLastSlide) {
        const size = safeScale * gradientToken.logoSize * 2.2;
        await drawSvgToCanvas(ctx, window.appConstants.IFMG_LOGO_SVG_STRING, currentX, currentY, size, size);
        currentY += size + safeScale * gradientToken.logoGap;
    }

    if (textContent.showEyebrowInput !== false && textContent.eyebrow) {
        ctx.font = `bold ${safeScale * gradientToken.eyebrowSize}px 'Archivo', sans-serif`;
        ctx.fillStyle = templateStyles.eyebrowColor;
        const spacing = safeScale * gradientToken.eyebrowTrackingEm * gradientToken.eyebrowSize;
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${spacing}px`;
        ctx.textBaseline = 'top';
        ctx.fillText(textContent.eyebrow.toUpperCase(), currentX, currentY);
        currentY += safeScale * gradientToken.eyebrowLineHeight + safeScale * gradientToken.eyebrowMarginBottom;
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "0px";
    }

    if (textContent.headline) {
        if (storyLayoutMode !== 'solid_color') {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = safeScale * gradientToken.shadowBlur;
            ctx.shadowOffsetY = safeScale * gradientToken.shadowOffsetY;
        }
        const headlineSize = safeScale * gradientToken.headlineSize * headlineSizeFactor;
        const headlineLineHeight = safeScale * gradientToken.headlineLineHeight * headlineLHFactor;
        ctx.font = `bold ${headlineSize}px 'Montagu Slab', serif`;
        const lines = window.richTextService.parseRichTextToLines(ctx, textContent.headline, ctx.font, textW);
        const drawLines = isFirstSlide ? lines.map(line => line.map(span => ({ ...span, text: span.text.toUpperCase() }))) : lines;
        window.richTextService.drawRichTextLines(ctx, drawLines, currentX, currentY, headlineLineHeight, textW, storyColor, true);
        currentY += lines.length * headlineLineHeight;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }

    if (textContent.showSubtitleInput !== false && textContent.subtitle) {
        currentY += safeScale * gradientToken.subtitleMarginTop;
        if (storyLayoutMode !== 'solid_color') {
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = safeScale * 8;
            ctx.shadowOffsetY = safeScale * 2;
        }
        ctx.font = `${safeScale * gradientToken.subtitleSize}px 'Archivo', sans-serif`;
        const lines = window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, ctx.font, textW);
        window.richTextService.drawRichTextLines(ctx, lines, currentX, currentY, safeScale * gradientToken.subtitleLineHeight, textW, templateStyles.subtitleColor);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }
}

window.canvasExportLayouts = { ...(window.canvasExportLayouts || {}), drawCarouselStory };
})();
