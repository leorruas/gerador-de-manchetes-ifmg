// Delegacao central de eventos para manter os templates sem handlers inline.
(() => {
const clickActions = {
  openHistoryModal: () => window.openHistoryModal(),
  handleNewImage: () => window.handleNewImage(),
  openExportModal: (event, el) => window.openExportModal(el.dataset.formatId || null),
  closeExportModal: () => window.closeExportModal(),
  openBatchExportModal: (event, el) => window.openBatchExportModal(el.dataset.formatId || null),
  closeBatchExportModal: () => window.closeBatchExportModal(),
  handleExport: (event, el) => window.handleExport(el.dataset.type, event),
  handleBatchExport: (event, el) => window.handleBatchExport(el.dataset.type, event),
  closeHistoryModal: () => window.closeHistoryModal(),
  restoreHistoryItem: (event, el) => window.restoreHistoryItem(Number(el.dataset.id)),
  handleTemplateChange: (event, el) => window.handleTemplateChange(el.dataset.templateId),
  toggleEyebrowInput: () => window.toggleEyebrowInput(),
  toggleSubtitleInput: () => window.toggleSubtitleInput(),
  handleSlideSwitch: (event, el) => window.handleSlideSwitch(el.dataset.slideId),
  addSlide: () => document.getElementById('image-upload')?.click(),
  toggleHideText: (event, el) => window.toggleHideText(el.dataset.formatId),
  syncHeadline: (event, el) => window.syncHeadline(event, el.dataset.formatId),
  syncSlides: (event, el) => window.syncSlides(event, el.dataset.scope),
   startHeadlineEdit: (event, el) => window.startHeadlineEdit(el.dataset.formatId),
   startEyebrowEdit: (event, el) => window.startEyebrowEdit(el.dataset.formatId),
   startSubtitleEdit: (event, el) => window.startSubtitleEdit(el.dataset.formatId),
   toggleFitMode: (event, el) => window.toggleFitMode(el.dataset.formatId),
  toggleCropMode: (event, el) => window.toggleCropMode(el.dataset.formatId),
  adjustZoom: (event, el) => window.adjustZoom(Number(el.dataset.delta)),
  cancelCropInline: (event, el) => window.cancelCropInline(el.dataset.formatId),
  saveCropInline: (event, el) => window.saveCropInline(el.dataset.formatId),
};

const inputActions = {
  handleSlugChange: (event) => window.handleSlugChange(event),
  handleEyebrowChange: (event) => window.handleEyebrowChange(event),
  handleSubtitleChange: (event) => window.handleSubtitleChange(event),
   updateHeadline: (event, el) => window.updateHeadline(event, el.dataset.formatId),
   updateEyebrow: (event) => window.updateEyebrow(event),
   updateSubtitle: (event) => window.updateSubtitle(event),
   handleZoomChange: (event) => window.handleZoomChange(event),
};

const blurActions = {
  commitMetadataChanges: () => window.commitMetadataChanges(),
   finishHeadlineEdit: (event, el) => window.finishHeadlineEdit(event, el.dataset.formatId),
   finishEyebrowEdit: (event) => window.finishEyebrowEdit(event),
   finishSubtitleEdit: (event) => window.finishSubtitleEdit(event),
 };

function runAction(map, event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const handler = map[target.dataset.action];
  if (handler) handler(event, target);
}

function runBlurAction(event) {
  const target = event.target.closest('[data-blur-action]');
  if (!target) return;
  const handler = blurActions[target.dataset.blurAction];
  if (handler) handler(event, target);
}

document.addEventListener('click', (event) => runAction(clickActions, event));
document.addEventListener('input', (event) => runAction(inputActions, event));
document.addEventListener('change', (event) => {
  if (event.target.dataset.action === 'handleImageSelect') {
    window.handleImageSelect(event);
  }
});
document.addEventListener('keydown', (event) => {
  const textBox = event.target.closest?.('[data-drag-type="text"]');
  if (textBox) window.handleTextPositionKeydown(event, textBox.dataset.formatId);
});
document.addEventListener('blur', runBlurAction, true);

document.addEventListener('dragover', (event) => {
  if (event.target.closest('[data-dropzone]')) window.handleDragOver(event);
});
document.addEventListener('dragleave', (event) => {
  if (event.target.closest('[data-dropzone]')) window.handleDragLeave(event);
});
document.addEventListener('drop', (event) => {
  if (event.target.closest('[data-dropzone]')) window.handleFileDrop(event);
});

function handleDragStart(event) {
  const dragTarget = event.target.closest('[data-drag-type]');
  if (dragTarget?.dataset.dragType) {
    window.startDrag(event, dragTarget.dataset.dragType, dragTarget.dataset.formatId);
    return;
  }

  if (event.target.closest('[data-stop-propagation]')) {
    window.stopEventPropagation(event);
  }
}

document.addEventListener('mousedown', handleDragStart);
document.addEventListener('touchstart', handleDragStart);
})();
