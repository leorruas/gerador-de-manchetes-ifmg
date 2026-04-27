// Reenquadramento, zoom e atalhos globais relacionados ao crop.
(() => {
const { state, schedulePersist, clamp, updateCropPreview } = window.mancheteApp;
const renderApp = () => window.renderApp();

window.toggleCropMode = (formatId) => {
    if (state.croppingFormatId === formatId) {
        window.cancelCropInline(formatId);
        return;
    }

    if(state.croppingFormatId) {
         window.cancelCropInline(state.croppingFormatId);
    }
    state.originalTransforms[formatId] = {
        zoom: state.transforms[formatId].zoom,
        position: { ...state.transforms[formatId].position },
        fitMode: state.transforms[formatId].fitMode || 'cover'
    };
    state.croppingFormatId = formatId;
    schedulePersist();
    renderApp();
};

window.saveCropInline = (formatId) => {
    delete state.originalTransforms[formatId];
    state.croppingFormatId = null;
    schedulePersist();
    renderApp();
};

window.cancelCropInline = (formatId) => {
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
})();
