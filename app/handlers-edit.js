// Handlers expostos no window para a delegacao central de eventos.
// Crop, metadados, manchetes e atalhos globais.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
window.toggleCropMode = (formatId) => {
    if (state.croppingFormatId === formatId) {
        // If clicking the same crop button again, just exit (same as cancel)
        window.cancelCropInline(formatId);
    } else {
        // If there's another crop open, cancel it first
        if(state.croppingFormatId) {
             window.cancelCropInline(state.croppingFormatId);
        }
        // Store the original transform state for cancellation
        state.originalTransforms[formatId] = {
            zoom: state.transforms[formatId].zoom,
            position: { ...state.transforms[formatId].position },
            fitMode: state.transforms[formatId].fitMode || 'cover'
        };
        state.croppingFormatId = formatId;
        schedulePersist();
        renderApp();
    }
};

window.saveCropInline = (formatId) => {
    delete state.originalTransforms[formatId];
    state.croppingFormatId = null;
    schedulePersist();
    renderApp();
};

window.cancelCropInline = (formatId) => {
    // Restore the original transform
    if (state.originalTransforms[formatId]) {
        state.transforms[formatId] = {
            zoom: state.originalTransforms[formatId].zoom,
            position: { ...state.originalTransforms[formatId].position },
            fitMode: state.originalTransforms[formatId].fitMode || 'cover'
        };
        delete state.originalTransforms[formatId];
    }
    state.croppingFormatId = null;
    schedulePersist();
    renderApp();
};

window.toggleFitMode = (formatId) => {
    const currentMode = state.transforms[formatId].fitMode || 'cover';
    state.transforms[formatId].fitMode = currentMode === 'contain' ? 'cover' : 'contain';
    schedulePersist();
    renderApp();
};

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

window.handleZoomChange = (event) => {
    const zoom = parseFloat(event.target.value);
    const formatId = state.croppingFormatId;
    if(formatId) {
        state.transforms[formatId].zoom = clamp(zoom, 1, 3);
        schedulePersist();
        updateCropPreview(formatId);
    }
};

window.adjustZoom = (delta) => {
    const formatId = state.croppingFormatId;
    if (!formatId) return;

    const currentZoom = state.transforms[formatId].zoom || 1;
    state.transforms[formatId].zoom = clamp(Math.round((currentZoom + delta) * 100) / 100, 1, 3);
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
            slide.eyebrows = { ...source.eyebrows };
            slide.subtitles = { ...source.subtitles };
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

window.handleGlobalKeydown = (event) => {
    if (state.croppingFormatId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '=', '-'].includes(event.key)) {
        event.preventDefault();
        const formatId = state.croppingFormatId;
        const transform = state.transforms[formatId];
        const step = event.shiftKey ? 0.08 : 0.03;

        if (event.key === '+' || event.key === '=') {
            transform.zoom = clamp(Math.round(((transform.zoom || 1) + 0.05) * 100) / 100, 1, 3);
        } else if (event.key === '-') {
            transform.zoom = clamp(Math.round(((transform.zoom || 1) - 0.05) * 100) / 100, 1, 3);
        } else {
            const delta = {
                ArrowLeft: { x: -step, y: 0 },
                ArrowRight: { x: step, y: 0 },
                ArrowUp: { x: 0, y: -step },
                ArrowDown: { x: 0, y: step },
            }[event.key];
            transform.position = {
                x: clamp((transform.position.x || 0) + delta.x, -1, 1),
                y: clamp((transform.position.y || 0) + delta.y, -1, 1),
            };
        }

        schedulePersist();
        updateCropPreview(formatId);
        return;
    }

    if (event.key === 'Escape') {
        if (state.showExportModal) {
            window.closeExportModal();
        } else if (state.showHistoryModal) {
            window.closeHistoryModal();
        }
    }
};

window.stopEventPropagation = (event) => {
    event.stopPropagation();
};
})();
