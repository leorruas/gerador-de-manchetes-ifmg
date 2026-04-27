// Handlers expostos no window para a delegacao central de eventos.
// Upload, dropzone e reset completo do editor.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
const MAX_SLIDES = 10;
const MAX_TOTAL_IMAGE_BYTES = 45 * 1024 * 1024;
const MAX_UPLOAD_DIMENSION = 2400;
const NORMALIZED_IMAGE_TYPE = 'image/jpeg';
const NORMALIZED_IMAGE_QUALITY = 0.88;

function getApproxDataUrlBytes(dataUrl) {
    const payload = String(dataUrl).split(',')[1] || '';
    return Math.ceil(payload.length * 0.75);
}

function getCurrentImageBytes() {
    return state.slides.reduce((total, slide) => total + getApproxDataUrlBytes(slide.baseImage), 0);
}

function readAsDataURLAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function canvasToDataUrl(canvas, type, quality) {
    return canvas.toDataURL(type, quality);
}

function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}

async function decodeImageFile(file) {
    if (window.createImageBitmap) {
        try {
            return await createImageBitmap(file, { imageOrientation: 'from-image' });
        } catch (error) {
            console.warn('createImageBitmap falhou; usando FileReader como fallback.', error);
        }
    }
    const dataUrl = await readAsDataURLAsync(file);
    return loadImageFromUrl(dataUrl);
}

async function normalizeImageFile(file) {
    const source = await decodeImageFile(file);
    const sourceWidth = source.naturalWidth || source.width;
    const sourceHeight = source.naturalHeight || source.height;
    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement('canvas');

    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    if (typeof source.close === 'function') source.close();

    return canvasToDataUrl(canvas, NORMALIZED_IMAGE_TYPE, NORMALIZED_IMAGE_QUALITY);
}

function createSlideData(dataUrl) {
    return {
         id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
         baseImage: dataUrl,
         templateId: state.templateId || DEFAULT_TEMPLATE_ID,
         eyebrow: state.eyebrow || constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow,
         eyebrows: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: state.eyebrows?.[curr.id] || state.eyebrow || constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow }), {}),
         headlines: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: state.headlines?.[curr.id] || 'Título da notícia ou chamada para a arte' }), {}),
         subtitle: state.subtitle || '',
         subtitles: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: state.subtitles?.[curr.id] || '' }), {}),
         slug: state.slug || 'noticia-exemplo',
         textVerticalPositions: createDefaultPositions(),
         transforms: createDefaultTransforms(),
         showEyebrowInput: state.showEyebrowInput ?? true,
         showSubtitleInput: state.showSubtitleInput ?? false,
         contrastBoost: {},
         hideText: typeof state.hideText === 'boolean' ? {} : { ...state.hideText },
         storyColor1: state.storyColor1 || '#0F172A',
         storyColor2: state.storyColor2 || '#1E293B',
         storyLayoutMode: state.storyLayoutMode ? { ...state.storyLayoutMode } : Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'gradient_bottom' }), {})
    };
}

window.handleImageFiles = async (filesArray) => {
    if (!filesArray || filesArray.length === 0) return;
    
    const files = Array.from(filesArray).filter(f => f.type.startsWith('image/'));
    if(files.length === 0) {
        showFeedback('Envie arquivos de imagem válidos (JPG, PNG ou WebP).', 'error');
        return;
    }

    let firstLoadSlideId = null;
    let rejectedCount = 0;
    let totalImageBytes = getCurrentImageBytes();

    for (let file of files) {
        if (state.slides.length >= MAX_SLIDES) {
            rejectedCount++;
            continue;
        }

        try {
            const dataUrl = await normalizeImageFile(file);
            const imageBytes = getApproxDataUrlBytes(dataUrl);
            if (totalImageBytes + imageBytes > MAX_TOTAL_IMAGE_BYTES) {
                rejectedCount++;
                continue;
            }

            const slide = createSlideData(dataUrl);
            state.slides.push(slide);
            totalImageBytes += imageBytes;
            if(!firstLoadSlideId && !state.activeSlideId) {
                firstLoadSlideId = slide.id;
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    if (firstLoadSlideId) {
        // Auto-switch to CAROUSEL_STORY when entering carousel mode
        if (state.slides.length > 1) {
            applyTemplate(constants.TEMPLATE_ID.CAROUSEL_STORY, false);
            state.slides.forEach(s => s.templateId = constants.TEMPLATE_ID.CAROUSEL_STORY);
        }
        loadSlideToState(firstLoadSlideId);
        state.baseImageElement.onload = () => {
             schedulePersist();
             showFeedback(`${files.length - rejectedCount} imagem(ns) carregada(s).${rejectedCount ? ' Algumas foram ignoradas para evitar excesso de memória.' : ''}`, rejectedCount ? 'info' : 'success');
             renderApp();
        };
        // The src assignment triggers the onload
    } else {
        // Auto-switch to CAROUSEL_STORY when entering carousel mode
        if (state.slides.length > 1) {
            applyTemplate(constants.TEMPLATE_ID.CAROUSEL_STORY, false);
            state.slides.forEach(s => s.templateId = constants.TEMPLATE_ID.CAROUSEL_STORY);
        }
        schedulePersist();
        showFeedback(`${files.length - rejectedCount} imagem(ns) adicionada(s) ao Carrossel.${rejectedCount ? ' Algumas foram ignoradas para evitar excesso de memória.' : ''}`, rejectedCount ? 'info' : 'success');
        renderApp();
    }
};

window.handleImageSelect = (event) => {
    window.handleImageFiles(event.target.files);
    event.target.value = '';
};

window.handleFileDrop = (event) => {
    event.preventDefault();
    document.getElementById('dropzone')?.classList.remove('border-solid', 'border-amber-400', 'bg-zinc-900', 'scale-105');
    window.handleImageFiles(event.dataTransfer.files);
};

window.handleDragOver = (event) => {
    event.preventDefault();
    document.getElementById('dropzone')?.classList.add('border-solid', 'border-amber-400', 'bg-zinc-900', 'scale-105');
};

window.handleDragLeave = (event) => {
    event.preventDefault();
    document.getElementById('dropzone')?.classList.remove('border-solid', 'border-amber-400', 'bg-zinc-900', 'scale-105');
};

window.handleNewImage = () => {
    state.activeSlideId = null;
    state.baseImage = null;
    state.slides = []; // Limpa o array
    
    // Reset state to defaults
    state.templateId = DEFAULT_TEMPLATE_ID;
    state.eyebrow = constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow;
    state.headlines = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'Título da notícia ou chamada para a arte' }), {});
    state.subtitle = '';
    state.slug = 'noticia-exemplo';
    state.textVerticalPositions = createDefaultPositions();
    state.transforms = createDefaultTransforms();
    state.originalTransforms = {};
    state.croppingFormatId = null;
    state.hideText = false;
    state.exportFormatIds = Object.values(constants.FORMATS).map((format) => format.id);
    schedulePersist();
    renderApp();
};
})();
