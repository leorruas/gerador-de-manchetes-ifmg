// Inicializacao: restaura rascunho salvo, liga atalhos globais e faz o primeiro render.
(() => {
const { constants, state, STATE_SCHEMA_VERSION, getPersistedState, clamp } = window.mancheteApp;
const renderApp = () => window.renderApp();
window.addEventListener('keydown', window.handleGlobalKeydown);
const persistedState = getPersistedState();
if (persistedState) {
    state.schemaVersion = STATE_SCHEMA_VERSION;
    if (persistedState.templateId && constants.TEMPLATES[persistedState.templateId]) {
        state.templateId = persistedState.templateId;
    }
    state.autoSync = persistedState.autoSync ?? state.autoSync;
    if (persistedState.eyebrows) {
        state.eyebrows = { ...state.eyebrows, ...persistedState.eyebrows };
    }
    
    if (persistedState.subtitles) {
        state.subtitles = { ...state.subtitles, ...persistedState.subtitles };
    }
    state.slug = persistedState.slug || state.slug;
    
    // Merge persisted positions/headlines with defaults for new format support
    if (persistedState.textVerticalPositions) {
        state.textVerticalPositions = { ...state.textVerticalPositions, ...persistedState.textVerticalPositions };
    }
    
    if (persistedState.headlines) {
        state.headlines = { ...state.headlines, ...persistedState.headlines };
    } else if (persistedState.headline) {
         state.headlines = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: persistedState.headline }), {});
    }
    if (persistedState.transforms) {
        state.transforms = Object.fromEntries(
            Object.entries(state.transforms).map(([formatId, fallbackTransform]) => {
                const savedTransform = persistedState.transforms[formatId] || fallbackTransform;
                return [formatId, {
                    zoom: savedTransform.zoom || fallbackTransform.zoom,
                    position: {
                        x: clamp(savedTransform.position?.x || 0, -1, 1),
                        y: clamp(savedTransform.position?.y || 0, -1, 1),
                    }
                }];
            })
        );
    }
    if (persistedState.baseImage) {
        state.baseImage = persistedState.baseImage;
        state.baseImageElement.onload = () => {
            renderApp();
        };
        state.baseImageElement.src = persistedState.baseImage;
    }
}

renderApp();
})();
