// Persistencia e migracoes do estado salvo no navegador.
(() => {
const { constants, state, STORAGE_KEY, STATE_SCHEMA_VERSION, saveStateToSlides } = window.mancheteApp;
const defaultStoryLayout = () => Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'gradient_bottom' }), {});

function getPersistedState() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        if (parsed && !parsed.schemaVersion) parsed.schemaVersion = 1;
        if (parsed && !parsed.slides && parsed.baseImage) migrateLegacyRoot(parsed);
        if (parsed && parsed.schemaVersion < 3) migrateV3(parsed);
        if (parsed && parsed.schemaVersion < 4) migrateV4(parsed);
        return parsed;
    } catch (error) {
        console.error('Persisted state could not be read:', error);
        return null;
    }
}

async function hydratePersistedImages(parsed) {
    if (!parsed?.slides) return parsed;
    for (const slide of parsed.slides) {
        if (slide.baseImage) {
            await window.imageStore?.saveSlideImage(slide.id, slide.baseImage);
            continue;
        }
        slide.baseImage = await window.imageStore?.getSlideImage(slide.id) || '';
    }
    parsed.baseImage = parsed.slides.find(slide => slide.id === parsed.activeSlideId)?.baseImage || parsed.slides[0]?.baseImage || '';
    return parsed;
}

function stripImagesFromState() {
    return {
        schemaVersion: STATE_SCHEMA_VERSION,
        activeSlideId: state.activeSlideId,
        slides: state.slides.map(slide => ({ ...slide, baseImage: '' })),
    };
}

function migrateLegacyRoot(parsed) {
    parsed.id = Date.now().toString();
    parsed.slides = [{
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
        hideText: typeof parsed.hideText === 'boolean' ? {} : (parsed.hideText || {}),
        storyColor1: parsed.storyColor1 || '#0F172A',
        storyColor2: parsed.storyColor2 || '#1E293B',
        storyLayoutMode: parsed.storyLayoutMode || defaultStoryLayout(),
    }];
    parsed.activeSlideId = parsed.id;
}

function migrateV3(parsed) {
    const migrateSlide = (slide) => {
        if (!slide.eyebrows) {
            slide.eyebrows = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: slide.eyebrow || '' }), {});
            delete slide.eyebrow;
        }
        if (!slide.subtitles) {
            slide.subtitles = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: slide.subtitle || '' }), {});
            delete slide.subtitle;
        }
        if (slide.autoSync === undefined) slide.autoSync = true;
    };
    if (parsed.slides) parsed.slides.forEach(migrateSlide);
    if (parsed.eyebrow !== undefined) {
        parsed.eyebrows = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: parsed.eyebrow || '' }), {});
        delete parsed.eyebrow;
    }
    if (parsed.subtitle !== undefined) {
        parsed.subtitles = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: parsed.subtitle || '' }), {});
        delete parsed.subtitle;
    }
    if (parsed.autoSync === undefined) parsed.autoSync = true;
    parsed.schemaVersion = 3;
}

function migrateV4(parsed) {
    const migrateSlide = (slide) => {
        if (!slide.storyColor1) slide.storyColor1 = '#0F172A';
        if (!slide.storyColor2) slide.storyColor2 = '#1E293B';
        if (!slide.storyLayoutMode) slide.storyLayoutMode = defaultStoryLayout();
    };
    if (parsed.slides) parsed.slides.forEach(migrateSlide);
    if (!parsed.storyColor1) parsed.storyColor1 = '#0F172A';
    if (!parsed.storyColor2) parsed.storyColor2 = '#1E293B';
    if (!parsed.storyLayoutMode) parsed.storyLayoutMode = defaultStoryLayout();
    parsed.schemaVersion = 4;
}

async function persistState() {
    try {
        saveStateToSlides();
        await Promise.all(state.slides.map((slide) => window.imageStore?.saveSlideImage(slide.id, slide.baseImage)));
        await window.imageStore?.deleteMissingImages(state.slides.map(slide => slide.id));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripImagesFromState()));
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) persistLiteState();
        else console.error('Persisted state could not be saved:', error);
    }
}

function persistLiteState() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripImagesFromState()));
    } catch (error) {
        console.error('Persisted lite state could not be saved:', error);
    }
}

function schedulePersist() {
    window.clearTimeout(schedulePersist.timeoutId);
    schedulePersist.timeoutId = window.setTimeout(persistState, 120);
}

Object.assign(window.mancheteApp, { getPersistedState, hydratePersistedImages, persistState, schedulePersist });
})();
