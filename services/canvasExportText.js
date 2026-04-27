// Calcula a caixa arrastavel de texto e delega o desenho ao layout do template.
(() => {
const constants = window.appConstants;
const { TEXT_BOX, TEMPLATE_TEXT, getCanvasScale } = window.layoutTokens;

function getTextOverlayBox(ctx, format, textContent, textVerticalPercent) {
    const glass = TEMPLATE_TEXT.glass;
    const textBoxWidth = format.width * TEXT_BOX.widthRatio;
    const boxX = (format.width - textBoxWidth) / 2;
    const safeScale = getCanvasScale(format);
    const padding = safeScale * glass.padding;
    const logoSize = safeScale * glass.logoSize;
    const textWidth = textBoxWidth - padding * 2 - (format.hasLogo ? logoSize + safeScale * glass.logoGap : 0);
    const eyebrowHeight = (textContent.showEyebrowInput !== false && textContent.eyebrow) ? safeScale * glass.eyebrowLineHeight + safeScale * glass.eyebrowMarginBottom : 0;
    const headlineLines = textContent.headline ? window.richTextService.parseRichTextToLines(ctx, textContent.headline, `${safeScale * glass.headlineSize}px Archivo`, textWidth) : [];
    const subtitleLines = (textContent.showSubtitleInput !== false && textContent.subtitle) ? window.richTextService.parseRichTextToLines(ctx, textContent.subtitle, `${safeScale * glass.subtitleSize}px Archivo`, textWidth) : [];
    const textHeight = eyebrowHeight + (headlineLines.length * safeScale * glass.headlineLineHeight) + (subtitleLines.length > 0 ? (subtitleLines.length * safeScale * glass.subtitleLineHeight) + safeScale * glass.subtitleMarginTop : 0);
    const boxContentHeight = format.hasLogo ? Math.max(textHeight, logoSize) : textHeight;
    const boxHeight = boxContentHeight + padding * 2;
    const marginPx = format.height * TEXT_BOX.safeMarginRatio;
    const absoluteMinTop = marginPx;
    const absoluteMaxTop = format.height - boxHeight - marginPx;
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
    }
}

window.canvasExportText = { drawTextOverlay };
})();
