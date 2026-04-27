// Handlers expostos no window para a delegacao central de eventos.
// Abertura do historico e restauracao de rascunhos salvos.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
window.openHistoryModal = async () => {
    state.showHistoryModal = true;
    renderModals(); // render modal container immediately (might show loading state)
    
    if (window.historyService) {
        state.historyItems = await window.historyService.getHistory();
        renderModals(); // render again with data
    }
};

window.closeHistoryModal = () => {
    state.showHistoryModal = false;
    renderModals();
};

window.restoreHistoryItem = async (id) => {
    if (window.historyService) {
        const item = await window.historyService.getHistoryItem(id);
        if (item) {
            // Restore state logic
            state.slides = item.slides || [];
            if (state.slides.length <= 1 && state.slides[0]?.templateId === constants.TEMPLATE_ID.CAROUSEL_STORY) {
                state.slides[0].templateId = DEFAULT_TEMPLATE_ID;
            }
            
            if (state.slides.length > 0) {
                // Version 2 structure
                state.activeSlideId = item.activeSlideId;
                loadSlideToState(state.activeSlideId);
            } else {
                // Legacy Version 1 restore mapped to new structure
                state.baseImage = item.baseImage;
                state.templateId = item.templateId;
                if (state.templateId === constants.TEMPLATE_ID.CAROUSEL_STORY) state.templateId = DEFAULT_TEMPLATE_ID;
                state.eyebrows = item.eyebrows || Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: item.eyebrow || '' }), {});
                state.headlines = item.headlines;
                state.subtitles = item.subtitles || Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: item.subtitle || '' }), {});
                state.slug = item.slug;
                state.textVerticalPositions = item.textVerticalPositions;
                state.transforms = item.transforms;
                state.hideText = {};
                
                // create single internal slide
                const slideId = Date.now().toString();
                state.activeSlideId = slideId;
                state.slides = [{
                    id: slideId,
                    baseImage: state.baseImage,
                    templateId: state.templateId,
                    autoSync: true,
                    eyebrows: { ...state.eyebrows },
                    headlines: { ...state.headlines },
                    subtitles: { ...state.subtitles },
                    slug: state.slug,
                    textVerticalPositions: state.textVerticalPositions,
                    transforms: state.transforms,
                    showEyebrowInput: item.showEyebrowInput ?? true,
                    showSubtitleInput: item.showSubtitleInput ?? false,
                    contrastBoost: item.contrastBoost || {},
                    hideText: {}
                }];
                state.baseImageElement.src = state.baseImage;
            }
            
            // Wait for image reload to trigger render
            state.baseImageElement.onload = () => {
                showFeedback('Arte restaurada com sucesso!', 'success');
                renderApp();
            };
            if(!state.baseImageElement.src) {
                state.baseImageElement.src = state.baseImage;
            }
            
            schedulePersist();
            window.closeHistoryModal();
        }
    }
};
})();
