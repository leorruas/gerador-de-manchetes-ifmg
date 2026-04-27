// Tokens compartilhados entre preview HTML e exportacao Canvas.
(() => {
const BASE_WIDTH = 1080;

const TEXT_BOX = {
  widthRatio: 0.8759,
  leftRatio: 0.062,
  safeMarginRatio: 0.05,
  heroBottomMarginRatio: 0.1,
};

const TEMPLATE_TEXT = {
  glass: {
    padding: 40,
    radius: 24,
    logoSize: 140,
    logoGap: 20,
    eyebrowSize: 22,
    eyebrowLineHeight: 28,
    eyebrowMarginBottom: 8,
    eyebrowTrackingEm: 0.18,
    headlineSize: 50,
    headlineLineHeight: 60,
    subtitleSize: 28,
    subtitleLineHeight: 36,
    subtitleMarginTop: 12,
  },
  gradient: {
    padding: 20,
    logoSize: 100,
    logoGap: 20,
    eyebrowSize: 24,
    eyebrowLineHeight: 30,
    eyebrowMarginBottom: 12,
    eyebrowTrackingEm: 0.2,
    headlineSize: 65,
    headlineLineHeight: 75,
    subtitleSize: 32,
    subtitleLineHeight: 42,
    subtitleMarginTop: 16,
    shadowBlur: 12,
    shadowOffsetY: 4,
  },
  quote: {
    padding: 40,
    iconSize: 80,
    iconGap: 16,
    headlineSize: 45,
    headlineLineHeight: 55,
    dividerMarginTop: 24,
    dividerMarginBottom: 16,
    dividerWidth: 64,
    dividerHeight: 4,
    eyebrowSize: 26,
    eyebrowLineHeight: 32,
    eyebrowMarginBottom: 8,
    eyebrowTrackingEm: 0.1,
    subtitleSize: 24,
    subtitleLineHeight: 32,
    subtitleMarginTop: 8,
  },
  infographic: {
    padding: 30,
    logoSize: 100,
    logoGap: 20,
    eyebrowSize: 140,
    eyebrowLineHeight: 140,
    eyebrowMarginBottom: 8,
    headlineSize: 35,
    headlineLineHeight: 42,
    subtitleSize: 26,
    subtitleLineHeight: 34,
    subtitleMarginTop: 16,
    subtitlePaddingX: 16,
    subtitlePaddingY: 8,
    subtitleRadius: 20,
    shadowBlur: 12,
    shadowOffsetY: 4,
  },
};

function getScale(format, previewWidth = format.width) {
  return (previewWidth / format.width) * (format.textScale || 1);
}

function getCanvasScale(format) {
  return (format.width / BASE_WIDTH) * (format.textScale || 1);
}

function px(scale, value) {
  return scale * value;
}

function getSafeMargins(size, templateId) {
  return {
    top: size * TEXT_BOX.safeMarginRatio,
    bottom: size * (templateId === 'HERO' ? TEXT_BOX.heroBottomMarginRatio : TEXT_BOX.safeMarginRatio),
  };
}

window.layoutTokens = {
  BASE_WIDTH,
  TEXT_BOX,
  TEMPLATE_TEXT,
  getScale,
  getCanvasScale,
  getSafeMargins,
  px,
};
})();
