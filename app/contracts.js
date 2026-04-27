// Verifica contratos globais e handlers usados pela delegacao de eventos.
(() => {
const requiredGlobals = [
  'appConstants',
  'layoutTokens',
  'richTextService',
  'canvasExportHelpers',
  'canvasExportLayouts',
  'canvasExportText',
  'canvasExportService',
  'historyService',
  'mancheteApp',
  'mancheteTemplates',
];

const requiredHandlers = [
  'handleImageFiles',
  'handleImageSelect',
  'handleFileDrop',
  'handleDragOver',
  'handleDragLeave',
  'handleNewImage',
  'openExportModal',
  'closeExportModal',
  'openBatchExportModal',
  'closeBatchExportModal',
  'handleSlugChange',
  'handleExport',
  'handleBatchExport',
  'openHistoryModal',
  'closeHistoryModal',
  'restoreHistoryItem',
  'toggleCropMode',
  'saveCropInline',
  'cancelCropInline',
  'toggleFitMode',
  'handleSlideSwitch',
  'toggleHideText',
  'handleZoomChange',
  'adjustZoom',
  'startHeadlineEdit',
  'updateHeadline',
  'finishHeadlineEdit',
  'syncHeadline',
  'syncSlides',
  'handleTextPositionKeydown',
  'handleGlobalKeydown',
  'stopEventPropagation',
  'startDrag',
];

function assertContracts() {
  const missingGlobals = requiredGlobals.filter((name) => !window[name]);
  const missingHandlers = requiredHandlers.filter((name) => typeof window[name] !== 'function');
  if (missingGlobals.length || missingHandlers.length) {
    throw new Error([
      'Contratos globais ausentes.',
      missingGlobals.length ? `Globals: ${missingGlobals.join(', ')}` : '',
      missingHandlers.length ? `Handlers: ${missingHandlers.join(', ')}` : '',
    ].filter(Boolean).join(' '));
  }
}

window.mancheteContracts = { requiredGlobals, requiredHandlers, assertContracts };
assertContracts();
})();
