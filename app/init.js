// Inicializacao: restaura rascunho salvo, liga atalhos globais e faz o primeiro render.
(async () => {
const { constants, state, STATE_SCHEMA_VERSION, getPersistedState, hydratePersistedImages, loadSlideToState, clamp } = window.mancheteApp;
const renderApp = () => window.renderApp();
window.addEventListener('keydown', window.handleGlobalKeydown);
const persistedState = await hydratePersistedImages(getPersistedState());
if (persistedState) {
    state.schemaVersion = STATE_SCHEMA_VERSION;
    if (Array.isArray(persistedState.slides) && persistedState.slides.length > 0) {
        state.slides = persistedState.slides;
        if (state.slides.length <= 1 && state.slides[0].templateId === constants.TEMPLATE_ID.CAROUSEL_STORY) {
            state.slides[0].templateId = constants.TEMPLATE_ID.NEWS;
        }
        state.baseImageElement.onload = () => {
            renderApp();
        };
        loadSlideToState(persistedState.activeSlideId || persistedState.slides[0].id);
    }
    if (persistedState.templateId && constants.TEMPLATES[persistedState.templateId]) {
        state.templateId = persistedState.templateId;
    }
    if (state.slides.length <= 1 && state.templateId === constants.TEMPLATE_ID.CAROUSEL_STORY) {
        state.templateId = constants.TEMPLATE_ID.NEWS;
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
    if (!state.baseImage && persistedState.baseImage) {
        state.baseImage = persistedState.baseImage;
        state.baseImageElement.onload = () => {
            renderApp();
        };
        state.baseImageElement.src = persistedState.baseImage;
    }
}

renderApp();
})();
