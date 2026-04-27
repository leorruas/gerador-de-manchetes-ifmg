// Handlers expostos no window para a delegacao central de eventos.
// Upload, dropzone e reset completo do editor.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
const MAX_SLIDES = 10;
const MAX_TOTAL_IMAGE_BYTES = 45 * 1024 * 1024;

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

function createSlideData(dataUrl) {
    return {
         id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
         baseImage: dataUrl,
         templateId: state.templateId || DEFAULT_TEMPLATE_ID,
         eyebrow: state.eyebrow || constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow,
         headlines: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: state.headlines?.[curr.id] || 'Título da notícia ou chamada para a arte' }), {}),
         subtitle: state.subtitle || '',
         slug: state.slug || 'noticia-exemplo',
         textVerticalPositions: createDefaultPositions(),
         transforms: createDefaultTransforms(),
         showEyebrowInput: state.showEyebrowInput ?? true,
         showSubtitleInput: state.showSubtitleInput ?? false,
         contrastBoost: {},
         hideText: typeof state.hideText === 'boolean' ? {} : { ...state.hideText }
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
            const dataUrl = await readAsDataURLAsync(file);
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
        loadSlideToState(firstLoadSlideId);
        state.baseImageElement.onload = () => {
             schedulePersist();
             showFeedback(`${files.length - rejectedCount} imagem(ns) carregada(s).${rejectedCount ? ' Algumas foram ignoradas para evitar excesso de memória.' : ''}`, rejectedCount ? 'info' : 'success');
             renderApp();
        };
        // The src assignment triggers the onload
    } else {
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
