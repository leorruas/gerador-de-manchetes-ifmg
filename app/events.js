// Delegacao central de eventos para manter os templates sem handlers inline.
(() => {
const clickActions = {
  openHistoryModal: () => window.openHistoryModal(),
  openPs27: () => window.openPs27(),
  closePs27: () => window.closePs27(),
  ps27SetFormat: (event, el) => window.ps27SetFormat(el.dataset.value),
  ps27SetSlogan: (event, el) => window.ps27SetSlogan(el.dataset.value),
  ps27SetSticker: (event, el) => window.ps27SetSticker(el.dataset.value),
  ps27SetCharacter: (event, el) => window.ps27SetCharacter(el.dataset.value),
  ps27SetHeadline: (event, el) => window.ps27BeginText(el),
  ps27SetEyebrow: (event, el) => window.ps27BeginText(el),
  ps27SetSubtitle: (event, el) => window.ps27BeginText(el),
  ps27ToggleDateTime: () => window.ps27ToggleDateTime(),
  ps27SetDateSticker: (event, el) => window.ps27SetDateSticker(el.dataset.value),
  ps27Download: (event, el) => window.ps27Download(el.dataset.format, el.dataset.type),
  ps27ToggleExportMenu: () => window.ps27ToggleExportMenu(),
  ps27SyncText: () => window.ps27SyncText(),
  ps27ToggleAutoSync: () => window.ps27ToggleAutoSync(),
  ps27ExportAll: (event, el) => window.ps27ExportAll(el.dataset.type, event),
  ps27ToggleEyebrow: (event, el) => window.ps27ToggleEyebrow(el.dataset.format),
  ps27ToggleSubtitle: (event, el) => window.ps27ToggleSubtitle(el.dataset.format),
  ps27NewPost: () => window.ps27NewPost(),
  handleNewImage: () => window.handleNewImage(),
  openExportModal: (event, el) => window.openExportModal(el.dataset.formatId || null),
  closeExportModal: () => window.closeExportModal(),
  openBatchExportModal: (event, el) => window.openBatchExportModal(el.dataset.formatId || null),
  closeBatchExportModal: () => window.closeBatchExportModal(),
  handleExport: (event, el) => window.handleExport(el.dataset.type, event),
  handleBatchExport: (event, el) => window.handleBatchExport(el.dataset.type, event),
  closeHistoryModal: () => window.closeHistoryModal(),
  restoreHistoryItem: (event, el) => window.restoreHistoryItem(Number(el.dataset.id)),
  toggleAutoSync: () => window.toggleAutoSync(),
  handleTemplateChange: (event, el) => window.handleTemplateChange(el.dataset.templateId),
  toggleEyebrowInput: () => window.toggleEyebrowInput(),
  toggleSubtitleInput: () => window.toggleSubtitleInput(),
  handleSlideSwitch: (event, el) => window.handleSlideSwitch(el.dataset.slideId),
  addSlide: () => document.getElementById('image-upload')?.click(),
  toggleHideText: (event, el) => window.toggleHideText(el.dataset.formatId),
  toggleContrastBoost: (event, el) => window.toggleContrastBoost(el.dataset.formatId),
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
  setStoryLayout: (event, el) => window.setStoryLayout(event, el.dataset.layout),
};

const inputActions = {
  handleSlugChange: (event) => window.handleSlugChange(event),
  ps27SetHeadline: (event, el) => window.ps27SetHeadline(event.target.innerText || event.target.value, el.dataset.format),
  ps27SetEyebrow: (event, el) => window.ps27SetEyebrow(event.target.innerText || event.target.value, el.closest('[id^="headline-box-"]')?.id.replace('headline-box-', '')),
  ps27SetSubtitle: (event, el) => window.ps27SetSubtitle(event.target.innerText || event.target.value, el.closest('[id^="headline-box-"]')?.id.replace('headline-box-', '')),
  ps27SetDatePart: (event, el) => window.ps27SetDatePart(el.dataset.part, event.target.value, event.target),
  handleEyebrowChange: (event, el) => window.handleEyebrowChange(event, el.dataset.formatId),
  handleSubtitleChange: (event, el) => window.handleSubtitleChange(event, el.dataset.formatId),
   updateHeadline: (event, el) => window.updateHeadline(event, el.dataset.formatId),
   updateEyebrow: (event, el) => window.updateEyebrow(event, el.dataset.formatId),
   updateSubtitle: (event, el) => window.updateSubtitle(event, el.dataset.formatId),
   handleZoomChange: (event) => window.handleZoomChange(event),
   handleStoryColor1: (event) => window.handleStoryColor1(event),
   handleStoryColor2: (event) => window.handleStoryColor2(event),
};

const blurActions = {
  commitMetadataChanges: () => window.commitMetadataChanges(),
  ps27RenderRichText: (event, el) => window.ps27RenderRichText(el),
   finishHeadlineEdit: (event, el) => window.finishHeadlineEdit(event, el.dataset.formatId),
   finishEyebrowEdit: (event, el) => window.finishEyebrowEdit(event, el.dataset.formatId),
   finishSubtitleEdit: (event, el) => window.finishSubtitleEdit(event, el.dataset.formatId),
 };

function runAction(map, event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const handler = map[target.dataset.action];
  if (handler) handler(event, target);
}

function runBlurAction(event) {
  if (!event.target || typeof event.target.closest !== 'function') return;
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
document.addEventListener('dragstart', (event) => {
  const slideButton = event.target.closest('[data-slide-order-id]');
  if (slideButton) window.handleSlideReorderStart(event, slideButton.dataset.slideOrderId);
});
document.addEventListener('dragover', (event) => {
  if (event.target.closest('[data-slide-order-id]')) window.handleSlideReorderOver(event);
});
document.addEventListener('drop', (event) => {
  const slideButton = event.target.closest('[data-slide-order-id]');
  if (slideButton) window.handleSlideReorderDrop(event, slideButton.dataset.slideOrderId);
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
