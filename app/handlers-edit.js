// Handlers expostos no window para a delegacao central de eventos.
// Metadados, manchetes e sincronizacao entre formatos/slides.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
window.handleSlideSwitch = (id) => {
    if(state.activeSlideId === id) return;
    loadSlideToState(id);
    schedulePersist();
    renderApp();
};

window.toggleHideText = (formatId) => {
    state.hideText[formatId] = !state.hideText[formatId];
    schedulePersist();
    renderApp();
};

window.toggleContrastBoost = (formatId) => {
    state.contrastBoost[formatId] = !state.contrastBoost[formatId];
    schedulePersist();
    renderApp();
};

window.startHeadlineEdit = (formatId) => {
    const textDiv = document.getElementById(`headline-text-${formatId}`);
    const textarea = document.getElementById(`headline-textarea-${formatId}`);
    if (textDiv && textarea) {
        textDiv.style.display = 'none';
        textarea.style.display = 'block';
        textarea.value = state.headlines[formatId];
        textarea.focus();
        textarea.select();
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

window.toggleAutoSync = () => {
    state.autoSync = !state.autoSync;
    
    if (state.autoSync) {
        // Ao ativar, sincronizamos todos os formatos com o conteúdo do primeiro formato disponível
        const firstId = Object.keys(state.headlines)[0];
        Object.keys(state.headlines).forEach(id => {
            state.headlines[id] = state.headlines[firstId];
            state.eyebrows[id] = state.eyebrows[firstId];
            state.subtitles[id] = state.subtitles[firstId];
        });
        showFeedback('Auto-Sync Ativado: Textos sincronizados.');
    } else {
        showFeedback('Auto-Sync Desativado: Edições agora são independentes.');
    }
    
    schedulePersist();
    renderApp();
};

window.updateHeadline = (event, formatId) => {
    const val = event.target.value;
    if (state.autoSync) {
        Object.keys(state.headlines).forEach(id => state.headlines[id] = val);
    } else {
        state.headlines[formatId] = val;
    }
    
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
    schedulePersist();
};

window.finishHeadlineEdit = (event, formatId) => {
    const val = event.target.value;
    if (state.autoSync) {
        Object.keys(state.headlines).forEach(id => state.headlines[id] = val);
    } else {
        state.headlines[formatId] = val;
    }
    schedulePersist();
    renderApp();
};

window.startEyebrowEdit = (formatId) => {
    const textDiv = document.getElementById(`eyebrow-text-${formatId}`);
    const textarea = document.getElementById(`eyebrow-textarea-${formatId}`);
    if (textDiv && textarea) {
        textDiv.style.display = 'none';
        textarea.style.display = 'block';
        textarea.value = state.eyebrows[formatId];
        textarea.focus();
        textarea.select();
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

window.updateEyebrow = (event, formatId) => {
    const val = event.target.value;
    if (state.autoSync) {
        Object.keys(state.eyebrows).forEach(id => state.eyebrows[id] = val);
    } else {
        state.eyebrows[formatId] = val;
    }
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
    schedulePersist();
};

window.handleEyebrowChange = window.updateEyebrow;

window.finishEyebrowEdit = (event, formatId) => {
    const val = event.target.value;
    if (state.autoSync) {
        Object.keys(state.eyebrows).forEach(id => state.eyebrows[id] = val);
    } else {
        state.eyebrows[formatId] = val;
    }
    schedulePersist();
    renderApp();
};

window.startSubtitleEdit = (formatId) => {
    const textDiv = document.getElementById(`subtitle-text-${formatId}`);
    const textarea = document.getElementById(`subtitle-textarea-${formatId}`);
    if (textDiv && textarea) {
        textDiv.style.display = 'none';
        textarea.style.display = 'block';
        textarea.value = state.subtitles[formatId];
        textarea.focus();
        textarea.select();
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

window.updateSubtitle = (event, formatId) => {
    const val = event.target.value;
    if (state.autoSync) {
        Object.keys(state.subtitles).forEach(id => state.subtitles[id] = val);
    } else {
        state.subtitles[formatId] = val;
    }
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
    schedulePersist();
};

window.handleSubtitleChange = window.updateSubtitle;

window.finishSubtitleEdit = (event, formatId) => {
    const val = event.target.value;
    if (state.autoSync) {
        Object.keys(state.subtitles).forEach(id => state.subtitles[id] = val);
    } else {
        state.subtitles[formatId] = val;
    }
    schedulePersist();
    renderApp();
};

window.syncHeadline = (event, sourceFormatId) => {
    event.stopPropagation();
    const textToSync = state.headlines[sourceFormatId];
    Object.keys(state.headlines).forEach(id => {
        state.headlines[id] = textToSync;
    });
    schedulePersist();
    showFeedback('Manchete copiada para todos os formatos.', 'success');
    renderApp();
};

window.syncSlides = (event, scope) => {
    event.stopPropagation();
    if (!state.slides || state.slides.length <= 1) return;

    saveStateToSlides();
    const source = state.slides.find(slide => slide.id === state.activeSlideId);
    if (!source) return;

    state.slides.forEach(slide => {
        if (slide.id === source.id) return;
        if (scope === 'headline') {
            slide.headlines = { ...source.headlines };
            return;
        }

        slide.templateId = source.templateId;
        slide.autoSync = source.autoSync;
        slide.eyebrows = { ...source.eyebrows };
        slide.subtitles = { ...source.subtitles };
        slide.slug = source.slug;
        slide.showEyebrowInput = source.showEyebrowInput;
        slide.showSubtitleInput = source.showSubtitleInput;
    });

    const label = scope === 'headline' ? 'Manchetes copiadas' : 'Metadados copiados';
    schedulePersist();
    showFeedback(`${label} para os outros slides.`, 'success');
    renderApp();
};

window.setStoryLayout = (event, layout) => {
    const button = event.target.closest('[data-format-id]');
    const formatId = button?.dataset.formatId;
    if (!formatId) return;
    state.storyLayoutMode[formatId] = layout;
    schedulePersist();
    renderApp();
};

window.handleStoryColor1 = (event) => {
    state.storyColor1 = event.target.value;
    schedulePersist();
};

window.handleStoryColor2 = (event) => {
    state.storyColor2 = event.target.value;
    schedulePersist();
};

window.stopEventPropagation = (event) => {
    event.stopPropagation();
};
})();
