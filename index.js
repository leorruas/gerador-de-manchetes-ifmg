
const constants = window.appConstants;
const canvasExport = window.canvasExportService;
const { renderRichTextHtml } = window.richTextService;
const STORAGE_KEY = 'mancheteexpress:editor-state';
const DEFAULT_TEMPLATE_ID = constants.TEMPLATE_ID.NEWS;

const createDefaultPositions = () =>
    Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 0.5 }), {});

const createDefaultTransforms = () =>
    Object.values(constants.FORMATS).reduce((acc, curr) => ({
        ...acc,
        [curr.id]: { zoom: 1, position: { x: 0, y: 0 } }
    }), {});

// --- APPLICATION STATE ---
let state = {
    baseImage: null,
    baseImageElement: new Image(),
    templateId: DEFAULT_TEMPLATE_ID,
    eyebrow: constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow,
    headline: 'Título da notícia ou chamada para a arte',
    subtitle: '',
    slug: 'noticia-exemplo',
    textVerticalPositions: createDefaultPositions(),
    transforms: createDefaultTransforms(),
    originalTransforms: {}, // To store state before cropping for cancellation
    croppingFormatId: null,
    showExportModal: false,
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

function getPersistedState() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Persisted state could not be read:', error);
        return null;
    }
}

function persistState() {
    try {
        const stateToPersist = {
            baseImage: state.baseImage,
            templateId: state.templateId,
            eyebrow: state.eyebrow,
            headline: state.headline,
            subtitle: state.subtitle,
            slug: state.slug,
            textVerticalPositions: state.textVerticalPositions,
            transforms: state.transforms,
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

function getPreviewImageMetrics(format, transform = state.transforms[format.id]) {
    const image = state.baseImageElement;
    if (!image?.naturalWidth || !image?.naturalHeight) return null;

    const containerAspect = format.width / format.height;
    const imageAspect = image.naturalWidth / image.naturalHeight;

    let baseWidthPercent = 100;
    let baseHeightPercent = 100;

    if (imageAspect > containerAspect) {
        baseWidthPercent = (imageAspect / containerAspect) * 100;
    } else {
        baseHeightPercent = (containerAspect / imageAspect) * 100;
    }

    const zoom = transform.zoom || 1;
    const widthPercent = baseWidthPercent * zoom;
    const heightPercent = baseHeightPercent * zoom;
    const overflowXPercent = Math.max(0, widthPercent - 100);
    const overflowYPercent = Math.max(0, heightPercent - 100);
    const x = clamp(transform.position.x || 0, -1, 1);
    const y = clamp(transform.position.y || 0, -1, 1);

    return {
        widthPercent,
        heightPercent,
        leftPercent: -overflowXPercent / 2 - (x * overflowXPercent / 2),
        topPercent: -overflowYPercent / 2 - (y * overflowYPercent / 2),
        overflowXPercent,
        overflowYPercent,
    };
}

function applyPreviewImageStyles(formatId) {
    const format = constants.FORMATS[formatId];
    const img = document.getElementById(`preview-image-${formatId}`);
    if (!format || !img) return;

    const metrics = getPreviewImageMetrics(format, state.transforms[formatId]);
    if (!metrics) return;

    img.style.width = `${metrics.widthPercent}%`;
    img.style.height = `${metrics.heightPercent}%`;
    img.style.left = `${metrics.leftPercent}%`;
    img.style.top = `${metrics.topPercent}%`;
}

function updateCropPreview(formatId) {
    applyPreviewImageStyles(formatId);
    requestAnimationFrame(() => applyPreviewImageStyles(formatId));
}

// --- EVENT HANDLERS (attached to window for inline HTML access) ---

window.handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.baseImage = event.target.result;
            state.baseImageElement.onload = () => {
                schedulePersist();
                showFeedback('Imagem carregada com sucesso.', 'success');
            };
            state.baseImageElement.src = state.baseImage;
        };
        reader.readAsDataURL(file);
    } else if (file) {
        showFeedback('Envie um arquivo de imagem válido (JPG, PNG ou WebP).', 'error');
    }
};

window.handleImageSelect = (event) => {
    window.handleImageFile(event.target.files?.[0]);
};

window.handleFileDrop = (event) => {
    event.preventDefault();
    document.getElementById('dropzone')?.classList.remove('border-solid', 'border-amber-400', 'bg-zinc-900', 'scale-105');
    window.handleImageFile(event.dataTransfer.files?.[0]);
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
    state.baseImage = null;
    // Reset state to defaults
    state.templateId = DEFAULT_TEMPLATE_ID;
    state.eyebrow = constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow;
    state.headline = 'Título da notícia ou chamada para a arte';
    state.subtitle = '';
    state.slug = 'noticia-exemplo';
    state.textVerticalPositions = createDefaultPositions();
    state.transforms = createDefaultTransforms();
    state.originalTransforms = {};
    state.croppingFormatId = null;
    state.exportFormatIds = Object.values(constants.FORMATS).map((format) => format.id);
    schedulePersist();
    renderApp();
};

window.openExportModal = (formatId = null) => {
    state.showExportModal = true;
    state.exportFormatIds = formatId ? [formatId] : Object.values(constants.FORMATS).map((format) => format.id);
    renderModals();
};

window.closeExportModal = () => {
    state.showExportModal = false;
    renderModals();
};

window.handleSlugChange = (event) => {
    state.slug = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
    schedulePersist();
    // We can re-render the modal to show the sanitized value
    const input = document.getElementById('slug-input');
    if(input) input.value = state.slug;
};

window.handleTemplateChange = (event) => {
    applyTemplate(event.target.value, false);
    schedulePersist();
    renderApp();
};

window.handleEyebrowChange = (event) => {
    state.eyebrow = event.target.value;
    schedulePersist();
};

window.handleSubtitleChange = (event) => {
    state.subtitle = event.target.value;
    schedulePersist();
};

window.commitMetadataChanges = () => {
    renderApp();
};

window.handleExport = async (type, event) => {
    if (!state.baseImage) return;
    const exportButton = event.target;
    const originalText = exportButton.innerHTML;
    exportButton.disabled = true;
    exportButton.innerHTML = 'Exportando...';

    try {
        for (const formatId of state.exportFormatIds) {
            const format = constants.FORMATS[formatId];
            await canvasExport.generateAndDownloadImage(
                format,
                state.baseImageElement,
                state.transforms[format.id],
                {
                    eyebrow: state.eyebrow,
                    headline: state.headline,
                    subtitle: state.subtitle,
                    templateId: state.templateId,
                },
                state.textVerticalPositions[format.id],
                state.slug,
                type
            );
        }
        showFeedback('Exportação concluída.', 'success');
    } catch (e) {
        console.error("Export failed:", e);
        showFeedback('Ocorreu um erro durante a exportação. Verifique o console para mais detalhes.', 'error');
    } finally {
        exportButton.disabled = false;
        exportButton.innerHTML = originalText;
        window.closeExportModal();
    }
};

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
            position: { ...state.transforms[formatId].position }
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
            position: { ...state.originalTransforms[formatId].position }
        };
        delete state.originalTransforms[formatId];
    }
    state.croppingFormatId = null;
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
        textarea.value = state.headline;
        textarea.focus();
        textarea.select();
        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

window.updateHeadline = (event) => {
    state.headline = event.target.value;
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
    schedulePersist();
};

window.finishHeadlineEdit = (event) => {
    state.headline = event.target.value;
    schedulePersist();
    renderApp(); // Re-render all previews with the new headline
};

window.handleGlobalKeydown = (event) => {
    if (event.key === 'Escape' && state.showExportModal) {
        window.closeExportModal();
    }
};

window.stopEventPropagation = (event) => {
    event.stopPropagation();
};

// --- Drag Handlers for Text Box and Crop Image ---
let dragContext = {};

window.startDrag = (event, type, formatId) => {
    event.preventDefault();
    dragContext = { type, formatId, startX: event.clientX || event.touches[0].clientX, startY: event.clientY || event.touches[0].clientY };
    if (type === 'text') {
        const element = document.getElementById(`headline-box-${formatId}`);
        dragContext.initialTop = element.offsetTop;
        document.body.style.cursor = 'grabbing';
    } else if (type === 'crop') {
        dragContext.initialPosition = { ...state.transforms[formatId].position };
        document.getElementById(`preview-${formatId}`).style.cursor = 'grabbing';
    }
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', endDrag);
};

function onDrag(event) {
    if (!dragContext.type) return;
    const currentX = event.clientX || event.touches[0].clientX;
    const currentY = event.clientY || event.touches[0].clientY;
    const deltaX = currentX - dragContext.startX;
    const deltaY = currentY - dragContext.startY;

    if (dragContext.type === 'text') {
        const preview = document.getElementById(`preview-${dragContext.formatId}`);
        const box = document.getElementById(`headline-box-${dragContext.formatId}`);
        if (!preview || !box) return;
        const maxTop = preview.offsetHeight - box.offsetHeight;
        let newTop = dragContext.initialTop + deltaY;
        newTop = Math.max(0, Math.min(newTop, maxTop));
        box.style.top = `${newTop}px`;
        const newPercentage = maxTop > 0 ? newTop / maxTop : 0.5;
        state.textVerticalPositions[dragContext.formatId] = newPercentage;

    } else if (dragContext.type === 'crop') {
        const newPos = {
            x: dragContext.initialPosition.x,
            y: dragContext.initialPosition.y
        };
        const preview = document.getElementById(`preview-${dragContext.formatId}`);
        const format = constants.FORMATS[dragContext.formatId];
        const metrics = preview && format ? getPreviewImageMetrics(format) : null;

        if (preview && metrics) {
            const overflowX = preview.clientWidth * (metrics.overflowXPercent / 100);
            const overflowY = preview.clientHeight * (metrics.overflowYPercent / 100);
            newPos.x = overflowX > 0 ? clamp(dragContext.initialPosition.x - ((deltaX * 2) / overflowX), -1, 1) : 0;
            newPos.y = overflowY > 0 ? clamp(dragContext.initialPosition.y - ((deltaY * 2) / overflowY), -1, 1) : 0;
        }
        state.transforms[dragContext.formatId].position = newPos;
        applyPreviewImageStyles(dragContext.formatId);
    }
}

function endDrag() {
    if (dragContext.type === 'text') {
        document.body.style.cursor = 'default';
    } else if (dragContext.type === 'crop' && dragContext.formatId) {
        const container = document.getElementById(`preview-${dragContext.formatId}`);
        if(container) container.style.cursor = 'default';
    }
    schedulePersist();
    dragContext = {};
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', endDrag);
}


// --- HTML TEMPLATE FUNCTIONS ---

const WelcomeScreen = () => `
    <div class="flex items-center justify-center min-h-screen p-6 sm:p-8">
        <div class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div class="flex flex-col items-center text-center">
                 <div class="flex flex-col items-center mb-8">
                    <div class="w-32 h-32 sm:w-40 sm:h-40 text-white">${constants.IFMG_LOGO_SVG_STRING}</div>
                    <h1 class="text-4xl md:text-5xl font-bold text-white mt-8 sm:mt-12">MancheteExpress</h1>
                </div>
                <label id="dropzone" for="image-upload" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleFileDrop(event)"
                    class="w-full p-8 sm:p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900">
                    ${constants.UploadIcon}
                    <p class="mt-4 font-semibold text-white">Arraste e solte uma imagem aqui</p>
                    <p class="text-sm text-zinc-400">ou clique para selecionar</p>
                    <input id="image-upload" type="file" accept="image/jpeg, image/png, image/webp" class="hidden" onchange="handleImageSelect(event)" />
                </label>
            </div>
            <div class="w-full">
                <h2 class="text-2xl font-bold mb-6 text-center lg:text-left">Como usar:</h2>
                <ol class="space-y-4">
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Upload}</div>
                        <div><p class="font-bold text-white">1. Envie uma imagem</p><p class="text-zinc-400">Arraste um arquivo para a área indicada ou clique para escolher (JPG, PNG, WebP).</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Crop}</div>
                        <div><p class="font-bold text-white">2. Reenquadre a imagem</p><p class="text-zinc-400">Use o ícone de crop em cada preview para abrir o editor, onde você pode ajustar o zoom e a posição da imagem.</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Edit}</div>
                        <div><p class="font-bold text-white">3. Edite a manchete</p><p class="text-zinc-400">Clique no texto sobre a imagem para editar a manchete. Use <code>**trecho**</code> para aplicar negrito em partes específicas.</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Drag}</div>
                        <div><p class="font-bold text-white">4. Ajuste a posição do texto</p><p class="text-zinc-400">Clique e arraste a caixa de texto verticalmente para encontrar a melhor posição em cada formato.</p></div>
                    </li>
                     <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Export}</div>
                        <div><p class="font-bold text-white">5. Exporte tudo</p><p class="text-zinc-400">Clique em "Exportar Todos", defina um nome de arquivo (slug) e escolha o formato para baixar todas as artes.</p></div>
                    </li>
                </ol>
            </div>
        </div>
    </div>
`;

const ImagePreview = (format) => {
    const transform = state.transforms[format.id];
    const isCropping = state.croppingFormatId === format.id;
    const imageMetrics = getPreviewImageMetrics(format, transform);
    
    const previewWidth = Math.min(window.innerWidth - 32, 640);
    const scaleFactor = previewWidth / format.width;
    
    return `
        <div class="mb-8 last:mb-0">
            <h3 class="text-lg font-bold text-zinc-400 mb-2">${format.name} (${format.width}x${format.height})</h3>
            <div id="preview-${format.id}" 
                 class="relative bg-black rounded-lg overflow-hidden shadow-lg w-full ${isCropping ? 'cursor-grab' : ''}" 
                 style="aspect-ratio: ${format.width} / ${format.height}"
                 onmousedown="${isCropping ? `startDrag(event, 'crop', '${format.id}')` : ''}"
                 ontouchstart="${isCropping ? `startDrag(event, 'crop', '${format.id}')` : ''}">
                
                <img id="preview-image-${format.id}" src="${state.baseImage}" alt="Preview ${format.name}" class="absolute pointer-events-none max-w-none" 
                     style="width:${imageMetrics ? imageMetrics.widthPercent : 100}%; height:${imageMetrics ? imageMetrics.heightPercent : 100}%; left:${imageMetrics ? imageMetrics.leftPercent : 0}%; top:${imageMetrics ? imageMetrics.topPercent : 0}%;">

                ${format.hasText ? `
                    <div id="headline-box-${format.id}" class="absolute w-[87.59%] left-[6.2%]" onmousedown="startDrag(event, 'text', '${format.id}')" ontouchstart="startDrag(event, 'text', '${format.id}')">
                         <div class="bg-black/50 backdrop-blur-sm rounded-2xl cursor-grab flex items-center" style="padding: ${scaleFactor * 40}px">
                            ${format.hasLogo ? `<div style="width:${scaleFactor * 140}px; height:${scaleFactor * 140}px; margin-right:${scaleFactor * 20}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            <div class="flex-grow min-w-0 flex flex-col items-start text-left">
                                ${state.eyebrow ? `<div class="block w-full text-left uppercase tracking-[0.18em] text-zinc-200/90 mb-2" style="font-size:${scaleFactor * 18}px; line-height:${scaleFactor * 24}px;">${state.eyebrow}</div>` : ''}
                                <div id="headline-text-${format.id}" class="block w-full text-white text-left" onclick="startHeadlineEdit('${format.id}')" style="font-size:${scaleFactor * 50}px; line-height:${scaleFactor * 60}px; text-align: left;">
                                    ${renderRichTextHtml(state.headline)}
                                </div>
                                <textarea id="headline-textarea-${format.id}" oninput="updateHeadline(event)" onblur="finishHeadlineEdit(event)" 
                                    class="block w-full bg-transparent text-white text-left resize-none border-none outline-none focus:ring-0 p-0" 
                                    style="display: none; font-size:${scaleFactor * 50}px; line-height:${scaleFactor * 60}px; text-align: left;"></textarea>
                                ${state.subtitle ? `<div class="block w-full text-left text-zinc-100/90 mt-3" style="font-size:${scaleFactor * 28}px; line-height:${scaleFactor * 36}px;">${renderRichTextHtml(state.subtitle)}</div>` : ''}
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${!isCropping ? `
                 <button aria-label="Exportar ${format.name}" onclick="openExportModal('${format.id}')" class="absolute top-2 right-14 px-3 py-2 text-xs font-semibold bg-black/50 rounded-full hover:bg-black/75 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400">
                     Exportar
                 </button>
                 <button aria-label="Reenquadrar ${format.name}" onclick="toggleCropMode('${format.id}')" class="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/75 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400">
                     ${constants.CropIcon}
                 </button>
                 ` : ''}

                 ${isCropping ? `
                    <div class="absolute inset-0 bg-black/40 pointer-events-none"></div>
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-md bg-black/60 backdrop-blur-sm rounded-3xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10" onmousedown="stopEventPropagation(event)" ontouchstart="stopEventPropagation(event)">
                        <div class="flex items-center gap-2 flex-grow min-w-0">
                            <button aria-label="Diminuir zoom" onclick="adjustZoom(-0.1)" class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400">-</button>
                            <input type="range" id="zoom-slider-${format.id}" min="1" max="3" step="0.01" value="${transform.zoom}" oninput="handleZoomChange(event)" onmousedown="stopEventPropagation(event)" ontouchstart="stopEventPropagation(event)"
                                   class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer">
                            <button aria-label="Aumentar zoom" onclick="adjustZoom(0.1)" class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400">+</button>
                        </div>
                        <div class="flex gap-2">
                            <button aria-label="Cancelar reenquadramento ${format.name}" onclick="cancelCropInline('${format.id}')" class="flex-1 bg-zinc-700 text-white font-semibold py-2 px-3 rounded-full text-sm hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400">Cancelar</button>
                            <button aria-label="Salvar reenquadramento ${format.name}" onclick="saveCropInline('${format.id}')" class="flex-1 bg-amber-400 text-black font-bold py-2 px-3 rounded-full text-sm hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">Salvar</button>
                        </div>
                    </div>
                 ` : ''}
            </div>
        </div>
    `;
};

const ControlsBar = () => `
    <footer class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-zinc-800 p-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 z-10">
        <button aria-label="Escolher nova imagem" onclick="handleNewImage()" class="bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400">Nova Imagem</button>
        <button aria-label="Exportar todos os formatos" onclick="openExportModal()" class="bg-amber-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">Exportar Todos</button>
    </footer>
`;

const EditorPanel = () => `
    <section class="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
        <div class="flex flex-col gap-4">
            <div>
                <h2 class="text-lg font-bold text-white">Configurações da arte</h2>
                <p class="text-sm text-zinc-400">Defina template, editoria e subtítulo. A manchete principal continua editável direto no preview.</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                    <span class="mb-2 block text-sm font-medium text-zinc-300">Template institucional</span>
                    <select aria-label="Selecionar template institucional" onchange="handleTemplateChange(event)" class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                        ${Object.values(constants.TEMPLATES).map((template) => `
                            <option value="${template.id}" ${state.templateId === template.id ? 'selected' : ''}>${template.name}</option>
                        `).join('')}
                    </select>
                </label>
                <label class="block">
                    <span class="mb-2 block text-sm font-medium text-zinc-300">Editoria</span>
                    <input aria-label="Editar editoria" type="text" value="${state.eyebrow}" oninput="handleEyebrowChange(event)" onblur="commitMetadataChanges()" class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ex: IFMG, Agenda IFMG, Comunicado" />
                </label>
            </div>
            <label class="block">
                <span class="mb-2 block text-sm font-medium text-zinc-300">Subtítulo</span>
                <textarea aria-label="Editar subtítulo" oninput="handleSubtitleChange(event)" onblur="commitMetadataChanges()" rows="2" class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" placeholder="${constants.TEMPLATES[state.templateId].subtitle}">${state.subtitle}</textarea>
            </label>
        </div>
    </section>
`;

const ExportModal = () => `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-black border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-lg w-[calc(100%-1.5rem)] max-w-sm text-center">
            <h2 class="text-2xl font-bold mb-4">${state.exportFormatIds.length === 1 ? 'Exportar Formato' : 'Exportar Imagens'}</h2>
            <div class="w-full mb-6">
                <label for="slug-input" class="block text-sm font-medium text-zinc-400 mb-2 text-left">Nome do arquivo (slug)</label>
                <input type="text" id="slug-input" value="${state.slug}" oninput="handleSlugChange(event)"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="ex: semana-de-calouros">
            </div>
            <p class="text-zinc-400 mb-2">${state.exportFormatIds.length === 1 ? constants.FORMATS[state.exportFormatIds[0]].name : 'Todos os formatos selecionados serão exportados.'}</p>
            <p class="text-zinc-400 mb-6">Escolha o formato de exportação:</p>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button aria-label="Exportar em PNG" onclick="handleExport('png', event)" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200">PNG</button>
                <button aria-label="Exportar em JPG" onclick="handleExport('jpeg', event)" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200">JPG</button>
            </div>
            <button aria-label="Cancelar exportação" onclick="closeExportModal()" class="mt-6 text-red-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 rounded">Cancelar</button>
        </div>
    </div>
`;

const FeedbackBanner = () => {
    if (!state.feedback) return '';

    const toneClass = {
        success: 'border-emerald-700/60 bg-emerald-950/90 text-emerald-100',
        error: 'border-red-700/60 bg-red-950/90 text-red-100',
        info: 'border-zinc-700 bg-zinc-900/90 text-zinc-100',
    }[state.feedback.tone] || 'border-zinc-700 bg-zinc-900/90 text-zinc-100';

    return `
        <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg">
            <div aria-live="polite" class="border rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm ${toneClass}">
                ${state.feedback.message}
            </div>
        </div>
    `;
};

// --- RENDER FUNCTIONS ---

function renderApp() {
    if (!appElement) return;

    if (!state.baseImage) {
        appElement.innerHTML = `
            ${FeedbackBanner()}
            ${WelcomeScreen()}
        `;
    } else {
        const previewsHTML = Object.values(constants.FORMATS).map(ImagePreview).join('');
        appElement.innerHTML = `
            ${FeedbackBanner()}
            <div class="min-h-screen bg-black text-white pb-28 sm:pb-24">
                <div class="max-w-2xl mx-auto py-6 sm:py-8 px-4">
                    ${EditorPanel()}
                    ${previewsHTML}
                </div>
                ${ControlsBar()}
            </div>
        `;
        // After rendering, we need to correctly position the text boxes
        // because their height is now known. This needs to be in the next
        // frame to ensure the DOM is painted and dimensions are available.
        requestAnimationFrame(() => {
            Object.values(constants.FORMATS).forEach(format => {
                if (format.hasText) {
                    const preview = document.getElementById(`preview-${format.id}`);
                    const box = document.getElementById(`headline-box-${format.id}`);
                    if (preview && box) {
                        const maxTop = preview.offsetHeight - box.offsetHeight;
                        const topPosition = maxTop > 0 ? state.textVerticalPositions[format.id] * maxTop : 0;
                        box.style.top = `${topPosition}px`;
                    }
                }
            });
        });
    }
}

function renderModals() {
    if (!modalContainerElement) return;

    if (state.showExportModal) {
        modalContainerElement.innerHTML = ExportModal();
    } else {
        modalContainerElement.innerHTML = '';
    }
}


// --- INITIALIZATION ---
window.addEventListener('keydown', window.handleGlobalKeydown);
const persistedState = getPersistedState();
if (persistedState) {
    if (persistedState.templateId && constants.TEMPLATES[persistedState.templateId]) {
        state.templateId = persistedState.templateId;
    }
    state.eyebrow = persistedState.eyebrow ?? state.eyebrow;
    state.headline = persistedState.headline || state.headline;
    state.subtitle = persistedState.subtitle || state.subtitle;
    state.slug = persistedState.slug || state.slug;
    state.textVerticalPositions = persistedState.textVerticalPositions || state.textVerticalPositions;
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
