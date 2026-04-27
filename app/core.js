// Estado compartilhado e persistencia local usados por todo o app.
(() => {
const constants = window.appConstants;
const canvasExport = window.canvasExportService;
const { renderRichTextHtml } = window.richTextService;
const STORAGE_KEY = 'mancheteexpress:editor-state';
const STATE_SCHEMA_VERSION = 2;
const DEFAULT_TEMPLATE_ID = constants.TEMPLATE_ID.NEWS;

const createDefaultPositions = () =>
    Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 0.5 }), {});

const createDefaultTransforms = () =>
    Object.values(constants.FORMATS).reduce((acc, curr) => ({
        ...acc,
        [curr.id]: { zoom: 1, position: { x: 0, y: 0 }, fitMode: 'cover' }
    }), {});

let state = {
    schemaVersion: STATE_SCHEMA_VERSION,

    // === Dados do Slide Ativo ===
    baseImage: null,
    baseImageElement: new Image(),
    templateId: DEFAULT_TEMPLATE_ID,
    eyebrow: constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow,
    headlines: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'Título da notícia ou chamada para a arte' }), {}),
    subtitle: '',
    slug: 'noticia-exemplo',
    textVerticalPositions: createDefaultPositions(),
    transforms: createDefaultTransforms(),
    showEyebrowInput: true,
    showSubtitleInput: false,
    contrastBoost: {},
    hideText: {}, // { 'instagram-post': true/false }

    // === Metadados do App Global (Array) ===
    slides: [], 
    activeSlideId: null,

    // === Estado Temporário / UI ===
    originalTransforms: {},
    croppingFormatId: null,
    showExportModal: false,
    showHistoryModal: false,
    historyItems: [],
    exportFormatIds: Object.values(constants.FORMATS).map((format) => format.id),
    feedback: null,
};

// --- DOM REFERENCES ---
const appElement = document.getElementById('app');
const modalContainerElement = document.getElementById('modal-container');

function showFeedback(message, tone = 'info') {
    state.feedback = { message, tone };
    renderApp();

    window.clearTimeout(showFeedback.timeoutId);
    showFeedback.timeoutId = window.setTimeout(() => {
        state.feedback = null;
        renderApp();
    }, 4000);
}

function loadSlideToState(slideId) {
    if(state.activeSlideId) {
        saveStateToSlides(); // Salva correções da aba atual antes de pular para próxima
    }
    const target = state.slides.find(s => s.id === slideId);
    if(target) {
        state.activeSlideId = target.id;
        state.baseImage = target.baseImage;
        state.templateId = target.templateId;
        state.eyebrow = target.eyebrow;
        state.headlines = { ...target.headlines };
        state.subtitle = target.subtitle;
        state.slug = target.slug;
        state.textVerticalPositions = { ...target.textVerticalPositions };
        state.transforms = { ...target.transforms };
        state.showEyebrowInput = target.showEyebrowInput;
        state.showSubtitleInput = target.showSubtitleInput;
        state.contrastBoost = { ...target.contrastBoost };
        state.hideText = typeof target.hideText === 'boolean' ? {} : { ...target.hideText };
        
        state.baseImageElement.src = target.baseImage;
    }
}

function saveStateToSlides() {
    if(!state.activeSlideId) return;
    const target = state.slides.find(s => s.id === state.activeSlideId);
    if(target) {
        target.baseImage = state.baseImage;
        target.templateId = state.templateId;
        target.eyebrow = state.eyebrow;
        target.headlines = { ...state.headlines };
        target.subtitle = state.subtitle;
        target.slug = state.slug;
        target.textVerticalPositions = { ...state.textVerticalPositions };
        target.transforms = { ...state.transforms };
        target.showEyebrowInput = state.showEyebrowInput;
        target.showSubtitleInput = state.showSubtitleInput;
        target.contrastBoost = { ...state.contrastBoost };
        target.hideText = { ...state.hideText };
    }
}

function getPersistedState() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        if (parsed && !parsed.schemaVersion) {
            parsed.schemaVersion = 1;
        }
        if(parsed && !parsed.slides && parsed.baseImage) {
            // Compatibilidade Reversa (Migração State V1 para V2)
            parsed.id = Date.now().toString();
            parsed.slides = [ {
                 id: parsed.id,
                 baseImage: parsed.baseImage,
                 templateId: parsed.templateId,
                 eyebrow: parsed.eyebrow,
                 headlines: parsed.headlines,
                 subtitle: parsed.subtitle,
                 slug: parsed.slug,
                 textVerticalPositions: parsed.textVerticalPositions,
                 transforms: parsed.transforms,
                 showEyebrowInput: parsed.showEyebrowInput,
                 showSubtitleInput: parsed.showSubtitleInput,
                 contrastBoost: parsed.contrastBoost || {},
                 hideText: typeof parsed.hideText === 'boolean' ? {} : (parsed.hideText || {})
            } ];
            parsed.activeSlideId = parsed.id;
        }
        return parsed;
    } catch (error) {
        console.error('Persisted state could not be read:', error);
        return null;
    }
}

function persistState() {
    try {
        saveStateToSlides(); // Garante o array cacheado sincrono ao atual
        const stateToPersist = {
            baseImage: state.baseImage, // keeps active slide for legacy history compat partially
            schemaVersion: STATE_SCHEMA_VERSION,
            slides: state.slides,
            activeSlideId: state.activeSlideId,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (error) {
        console.error('Persisted state could not be saved:', error);
    }
}

function schedulePersist() {
    window.clearTimeout(schedulePersist.timeoutId);
    schedulePersist.timeoutId = window.setTimeout(persistState, 120);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function applyTemplate(templateId, shouldOverwriteEmpty = false) {
    const template = constants.TEMPLATES[templateId];
    if (!template) return;

    const previousTemplate = constants.TEMPLATES[state.templateId];
    state.templateId = templateId;

    if (shouldOverwriteEmpty || !state.eyebrow || state.eyebrow === previousTemplate?.eyebrow) {
        state.eyebrow = template.eyebrow;
    }

    if (shouldOverwriteEmpty || !state.subtitle || state.subtitle === previousTemplate?.subtitle) {
        state.subtitle = '';
    }
}

window.mancheteApp = {
  constants,
  canvasExport,
  renderRichTextHtml,
  STORAGE_KEY,
  STATE_SCHEMA_VERSION,
  DEFAULT_TEMPLATE_ID,
  state,
  appElement,
  modalContainerElement,
  createDefaultPositions,
  createDefaultTransforms,
  showFeedback,
  loadSlideToState,
  saveStateToSlides,
  getPersistedState,
  persistState,
  schedulePersist,
  clamp,
  applyTemplate,
};
})();
