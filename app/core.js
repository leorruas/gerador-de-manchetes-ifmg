// Estado compartilhado e persistencia local usados por todo o app.
(() => {
const constants = window.appConstants;
const canvasExport = window.canvasExportService;
const { renderRichTextHtml } = window.richTextService;
const STORAGE_KEY = 'mancheteexpress:editor-state';
const STATE_SCHEMA_VERSION = 4;
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
    mode: 'manchetes',
    ps27: {
        format: 'post',
        slogan: 'slogan-ps27',
        sticker: 'adesivo-retangular-amarelo',
        character: 'lucas',
        headline: 'Digite o seu texto aqui',
        headlines: {
            post: 'Digite o seu texto aqui',
            story: 'Digite o seu texto aqui',
            campi: 'Digite o seu texto aqui',
            portal: 'Digite o seu texto aqui',
        },
        autoSync: true,
        eyebrows: { post: 'Editoria', story: 'Editoria', campi: 'Editoria', portal: 'Editoria' },
        subtitles: { post: 'Seu subtítulo aqui', story: 'Seu subtítulo aqui', campi: 'Seu subtítulo aqui', portal: 'Seu subtítulo aqui' },
        showEyebrows: { post: true, story: true, campi: true, portal: true },
        showSubtitles: { post: false, story: false, campi: false, portal: false },
        showDateTime: false,
        dateSticker: 'adesivo-data-amarelo',
        dateDay: '',
        dateMonth: '',
        dateHour: '',
        showExportMenu: false,
    },

    // === Dados do Slide Ativo ===
    baseImage: null,
    baseImageElement: new Image(),
    templateId: DEFAULT_TEMPLATE_ID,
    autoSync: true,
    eyebrows: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow }), {}),
    headlines: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'Título da notícia ou chamada para a arte' }), {}),
    subtitles: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: '' }), {}),
    slug: 'noticia-exemplo',
    textVerticalPositions: createDefaultPositions(),
    transforms: createDefaultTransforms(),
    showEyebrowInput: true,
    showSubtitleInput: false,
    contrastBoost: {},
    hideText: {}, // { 'instagram-post': true/false }
    storyColor1: '#0F172A',
    storyColor2: '#1E293B',
    storyLayoutMode: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'gradient_bottom' }), {}),

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
        state.autoSync = target.autoSync ?? true;
        state.eyebrows = { ...target.eyebrows };
        state.headlines = { ...target.headlines };
        state.subtitles = { ...target.subtitles };
        state.slug = target.slug;
        state.textVerticalPositions = { ...target.textVerticalPositions };
        state.transforms = { ...target.transforms };
        state.showEyebrowInput = target.showEyebrowInput;
        state.showSubtitleInput = target.showSubtitleInput;
        state.contrastBoost = { ...target.contrastBoost };
        state.hideText = typeof target.hideText === 'boolean' ? {} : { ...target.hideText };
        state.storyColor1 = target.storyColor1 || '#0F172A';
        state.storyColor2 = target.storyColor2 || '#1E293B';
        state.storyLayoutMode = target.storyLayoutMode ? { ...target.storyLayoutMode } : Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'gradient_bottom' }), {});
        
        state.baseImageElement.src = target.baseImage;
    }
}

function saveStateToSlides() {
    if(!state.activeSlideId) return;
    const target = state.slides.find(s => s.id === state.activeSlideId);
    if(target) {
        target.baseImage = state.baseImage;
        target.templateId = state.templateId;
        target.autoSync = state.autoSync;
        target.eyebrows = { ...state.eyebrows };
        target.headlines = { ...state.headlines };
        target.subtitles = { ...state.subtitles };
        target.slug = state.slug;
        target.textVerticalPositions = { ...state.textVerticalPositions };
        target.transforms = { ...state.transforms };
        target.showEyebrowInput = state.showEyebrowInput;
        target.showSubtitleInput = state.showSubtitleInput;
        target.contrastBoost = { ...state.contrastBoost };
        target.hideText = { ...state.hideText };
        target.storyColor1 = state.storyColor1;
        target.storyColor2 = state.storyColor2;
        target.storyLayoutMode = { ...state.storyLayoutMode };
        // Colors are global — propagate to all slides (Layout mode remains per-slide)
        state.slides.forEach(s => {
            s.storyColor1 = state.storyColor1;
            s.storyColor2 = state.storyColor2;
        });
    }
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function applyTemplate(templateId, shouldOverwriteEmpty = false) {
    const template = constants.TEMPLATES[templateId];
    if (!template) return;

    const previousTemplate = constants.TEMPLATES[state.templateId];
    state.templateId = templateId;

    if (shouldOverwriteEmpty || Object.values(state.eyebrows).every(v => !v || v === previousTemplate?.eyebrow)) {
        const newVal = template.eyebrow;
        Object.keys(state.eyebrows).forEach(id => state.eyebrows[id] = newVal);
    }

    if (shouldOverwriteEmpty || Object.values(state.subtitles).every(v => !v || v === previousTemplate?.subtitle)) {
        Object.keys(state.subtitles).forEach(id => state.subtitles[id] = '');
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
  clamp,
  applyTemplate,
};
})();
