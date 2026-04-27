// Handlers expostos no window para a delegacao central de eventos.
// Modais e execucao de exportacao individual ou em lote.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
window.openExportModal = (formatId = null) => {
    state.showExportModal = true;
    if (formatId) {
        state.exportFormatIds = [formatId];
    } else {
        const activeFormats = state.slides && state.slides.length > 1 
            ? [constants.FORMATS[constants.FormatId.INSTA_POST], constants.FORMATS[constants.FormatId.INSTA_STORY]]
            : Object.values(constants.FORMATS);
        state.exportFormatIds = activeFormats.map((format) => format.id);
    }
    renderModals();
};

window.closeExportModal = () => {
    state.showExportModal = false;
    renderModals();
};

window.openBatchExportModal = (formatId = null) => {
    state.showBatchExportModal = true;
    if (formatId) {
        state.batchExportFormatIds = [formatId];
    } else {
        state.batchExportFormatIds = [constants.FormatId.INSTA_POST, constants.FormatId.INSTA_STORY];
    }
    renderModals();
};

window.closeBatchExportModal = () => {
    state.showBatchExportModal = false;
    renderModals();
};

window.handleSlugChange = (event) => {
    state.slug = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
    schedulePersist();
    // We can re-render the modal to show the sanitized value
    const input = document.getElementById('slug-input');
    if(input) input.value = state.slug;
};

window.toggleEyebrowInput = () => {
    state.showEyebrowInput = !state.showEyebrowInput;
    if (!state.showEyebrowInput) {
        state.eyebrow = '';
    }
    schedulePersist();
    renderApp();
};

window.toggleSubtitleInput = () => {
    state.showSubtitleInput = !state.showSubtitleInput;
    if (!state.showSubtitleInput) {
        state.subtitle = '';
    }
    schedulePersist();
    renderApp();
};

window.handleTemplateChange = (templateId) => {
    applyTemplate(templateId, false);
    schedulePersist();
    renderApp();
};

window.handleEyebrowChange = (event) => {
    state.eyebrow = event.target.value;
    schedulePersist();
};

window.handleSubtitleChange = (event) => {
    state.subtitle = event.target.value;
    schedulePersist();
};

window.commitMetadataChanges = () => {
    renderApp();
};

window.handleExport = async (type, event) => {
    if (!state.baseImage) return;
    const exportButton = event.target;
    const originalText = exportButton.innerHTML;
    exportButton.disabled = true;
    exportButton.innerHTML = 'Exportando...';

    try {
        for (const formatId of state.exportFormatIds) {
            const format = constants.FORMATS[formatId];
            await canvasExport.generateAndDownloadImage(
                format,
                state.baseImageElement,
                state.transforms[format.id],
                {
                    headline: state.headlines[formatId] || '',
                    eyebrow: state.eyebrow || '',
                    subtitle: state.subtitle || '',
                    templateId: state.templateId,
                    showEyebrowInput: state.showEyebrowInput,
                    showSubtitleInput: state.showSubtitleInput,
                    contrastBoost: !!(state.contrastBoost && state.contrastBoost[formatId]),
                    hideText: !!(state.hideText && state.hideText[formatId])
                },
                state.textVerticalPositions[format.id],
                state.slug,
                type
            );
            // Delay para evitar bloqueio de downloads em massa no navegador
            await new Promise(res => setTimeout(res, 600));
        }
        showFeedback('Exportação concluída.', 'success');
        
        if (window.historyService) {
            window.historyService.incrementStats();
            await window.historyService.saveStateToHistory(state);
        }
        
    } catch (e) {
        console.error("Export failed:", e);
        showFeedback('Ocorreu um erro durante a exportação. Verifique o console para mais detalhes.', 'error');
    } finally {
        exportButton.disabled = false;
        exportButton.innerHTML = originalText;
        window.closeExportModal();
    }
};

window.handleBatchExport = async (type, event) => {
    const exportButton = event.target;
    const originalText = exportButton.innerHTML;
    exportButton.disabled = true;
    exportButton.innerHTML = 'Processando carrossel...';

    saveStateToSlides();  
    
    try {
        let i = 1;
        for (const slide of state.slides) {
            const slideImg = new Image();
            await new Promise((res, rej) => {
                slideImg.onload = res;
                slideImg.onerror = rej;
                slideImg.src = slide.baseImage;
            });

            // Usa os formatos selecionados para o lote (específico ou todos)
            const batchFormats = state.batchExportFormatIds || [constants.FormatId.INSTA_POST, constants.FormatId.INSTA_STORY];
            
            for (const formatId of batchFormats) {
                const format = constants.FORMATS[formatId];
                const ts = slide.transforms[formatId] || createDefaultTransforms()[formatId];
                
                await canvasExport.generateAndDownloadImage(
                    format,
                    slideImg,
                    ts,
                    {
                        headline: slide.headlines[formatId] || '',
                        eyebrow: slide.eyebrow || '',
                        subtitle: slide.subtitle || '',
                        templateId: slide.templateId,
                        showEyebrowInput: slide.showEyebrowInput,
                        showSubtitleInput: slide.showSubtitleInput,
                        contrastBoost: !!(slide.contrastBoost && slide.contrastBoost[formatId]),
                        hideText: !!(slide.hideText && slide.hideText[formatId])
                    },
                    slide.textVerticalPositions && slide.textVerticalPositions[formatId] != null ? slide.textVerticalPositions[formatId] : 0.5,
                    `${slide.slug || 'carrossel'}-slide${i}`,
                    type
                );
            }
            
            i++;
            await new Promise(res => setTimeout(res, 500)); 
        }
        showFeedback('Carrossel exportado com sucesso.', 'success');
        
        if (window.historyService) {
            window.historyService.incrementStats(state.slides.length);
            await window.historyService.saveStateToHistory(state);
        }
    } catch (e) {
        console.error("Batch Export failed:", e);
        showFeedback('Ocorreu um erro durante a exportação do carrossel.', 'error');
    } finally {
        exportButton.disabled = false;
        exportButton.innerHTML = originalText;
        window.closeBatchExportModal();
    }
};
})();
