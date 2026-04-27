// Calcula a caixa arrastavel de texto e delega o desenho ao layout do template.
(() => {
const constants = window.appConstants;
const { TEXT_BOX, TEMPLATE_TEXT, getCanvasScale, getSafeMargins } = window.layoutTokens;

function getTextOverlayBox(ctx, format, textContent, textVerticalPercent) {
    const templateId = textContent.templateId || window.appConstants.TEMPLATE_ID.NEWS;
    const templateMap = {
        NEWS: TEMPLATE_TEXT.glass,
        EVENT: TEMPLATE_TEXT.glass,
        NOTICE: TEMPLATE_TEXT.glass,
        HERO: TEMPLATE_TEXT.gradient,
        QUOTE: TEMPLATE_TEXT.quote,
        NUMBER: TEMPLATE_TEXT.infographic,
        CAROUSEL_STORY: TEMPLATE_TEXT.gradient
    };
    const tokens = templateMap[templateId] || TEMPLATE_TEXT.glass;
    
    const textBoxWidth = format.width * TEXT_BOX.widthRatio;
    const boxX = (format.width - textBoxWidth) / 2;
    const safeScale = getCanvasScale(format);
    const padding = safeScale * tokens.padding;
    const logoSize = safeScale * tokens.logoSize;
    
    const textWidth = textBoxWidth - padding * 2 - (format.hasLogo ? logoSize + tokens.logoGap * safeScale : 0);
    const eyebrowHeight = (textContent.showEyebrowInput !== false && textContent.eyebrow) ? safeScale * tokens.eyebrowLineHeight + safeScale * tokens.eyebrowMarginBottom : 0;
    
    const headlineLines = textContent.headline ? window.richTextService.parseRichTextToLines(ctx, textContent.headline, `${safeScale * tokens.headlineSize}px Archivo`, textWidth) : [];
    const subtitleLines = (textContent.showSubtitleInput !== false && textContent.subtitle) ? window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * tokens.subtitleSize}px Archivo`, textWidth) : [];
    
    const headlineHeight = headlineLines.length * safeScale * tokens.headlineLineHeight;
    const subtitleHeight = subtitleLines.length > 0 ? (subtitleLines.length * safeScale * tokens.subtitleLineHeight) + (tokens.subtitleMarginTop * safeScale) : 0;
    
    const textHeight = eyebrowHeight + headlineHeight + subtitleHeight;
    const boxContentHeight = format.hasLogo ? Math.max(textHeight, logoSize) : textHeight;
    const boxHeight = boxContentHeight + padding * 2;
    
    const safeMargins = getSafeMargins(format.height, templateId);
    const absoluteMinTop = safeMargins.top;
    const absoluteMaxTop = format.height - boxHeight - safeMargins.bottom;
    
    const usableMinTop = Math.min(absoluteMinTop, absoluteMaxTop < absoluteMinTop ? 0 : absoluteMinTop);
    const usableMaxTop = Math.max(absoluteMaxTop, absoluteMaxTop < absoluteMinTop ? format.height - boxHeight : absoluteMaxTop);
    const range = usableMaxTop - usableMinTop;
    const boxY = range > 0 ? usableMinTop + (textVerticalPercent * range) : usableMinTop;
    
    return { textBoxWidth, boxX, boxY, boxHeight, safeScale, padding, logoSize };
}

async function drawTextOverlay(ctx, canvas, format, textContent, textVerticalPercent) {
    if (!format.hasText || textContent.hideText === true) return;
    const templateStyles = constants.TEMPLATES[textContent.templateId || constants.TEMPLATE_ID.NEWS];
    const layoutData = { canvas, format, textContent, templateStyles, ...getTextOverlayBox(ctx, format, textContent, textVerticalPercent) };
    if (templateStyles.layoutType === constants.LAYOUT_TYPE.GLASS_BOX) {
        await window.canvasExportLayouts.drawGlassBox(ctx, layoutData);
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.GRADIENT) {
        await window.canvasExportLayouts.drawGradient(ctx, layoutData);
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.QUOTE) {
        await window.canvasExportLayouts.drawQuote(ctx, layoutData);
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.INFOGRAPHIC) {
        await window.canvasExportLayouts.drawInfographic(ctx, layoutData);
    } else if (templateStyles.layoutType === constants.LAYOUT_TYPE.CAROUSEL_STORY) {
        await window.canvasExportLayouts.drawCarouselStory(ctx, layoutData);
    }
}

window.canvasExportText = { drawTextOverlay };
})();
