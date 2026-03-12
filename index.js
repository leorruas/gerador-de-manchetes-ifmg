
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

let state = {
    baseImage: null,
    baseImageElement: new Image(),
    templateId: DEFAULT_TEMPLATE_ID,
    eyebrow: constants.TEMPLATES[DEFAULT_TEMPLATE_ID].eyebrow,
    headlines: Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'Título da notícia ou chamada para a arte' }), {}),
    subtitle: '',
    slug: 'noticia-exemplo',
    textVerticalPositions: createDefaultPositions(),
    transforms: createDefaultTransforms(),
    originalTransforms: {}, // To store state before cropping for cancellation
    croppingFormatId: null,
    showExportModal: false,
    showHistoryModal: false,
    showEyebrowInput: true,
    showSubtitleInput: false,
    contrastBoost: {},
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
            headlines: state.headlines,
            subtitle: state.subtitle,
            slug: state.slug,
            textVerticalPositions: state.textVerticalPositions,
            transforms: state.transforms,
            showEyebrowInput: state.showEyebrowInput,
            showSubtitleInput: state.showSubtitleInput,
            contrastBoost: state.contrastBoost
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
    state.headlines = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: 'Título da notícia ou chamada para a arte' }), {});
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

window.toggleEyebrowInput = () => {
    state.showEyebrowInput = !state.showEyebrowInput;
    if (!state.showEyebrowInput) {
        state.eyebrow = '';
    }
    schedulePersist();
    renderApp();
};

window.toggleSubtitleInput = () => {
    state.showSubtitleInput = !state.showSubtitleInput;
    if (!state.showSubtitleInput) {
        state.subtitle = '';
    }
    schedulePersist();
    renderApp();
};

window.handleTemplateChange = (templateId) => {
    applyTemplate(templateId, false);
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
                    headline: state.headlines[formatId],
                    eyebrow: state.eyebrow,
                    subtitle: state.subtitle,
                    templateId: state.templateId,
                    showEyebrowInput: state.showEyebrowInput,
                    showSubtitleInput: state.showSubtitleInput,
                    contrastBoost: state.contrastBoost[formatId] || false
                },
                state.textVerticalPositions[format.id],
                state.slug,
                type
            );
        }
        showFeedback('Exportação concluída.', 'success');
        
        if (window.historyService) {
            window.historyService.incrementStats();
            await window.historyService.saveStateToHistory(state);
        }
        
    } catch (e) {
        console.error("Export failed:", e);
        showFeedback('Ocorreu um erro durante a exportação. Verifique o console para mais detalhes.', 'error');
    } finally {
        exportButton.disabled = false;
        exportButton.innerHTML = originalText;
        window.closeExportModal();
    }
};

window.openHistoryModal = async () => {
    state.showHistoryModal = true;
    renderModals(); // render modal container immediately (might show loading state)
    
    if (window.historyService) {
        state.historyItems = await window.historyService.getHistory();
        renderModals(); // render again with data
    }
};

window.closeHistoryModal = () => {
    state.showHistoryModal = false;
    renderModals();
};

window.restoreHistoryItem = async (id) => {
    if (window.historyService) {
        const item = await window.historyService.getHistoryItem(id);
        if (item) {
            // Restore state logic
            state.baseImage = item.baseImage;
            state.templateId = item.templateId;
            state.eyebrow = item.eyebrow;
            state.headlines = item.headlines;
            state.subtitle = item.subtitle;
            state.slug = item.slug;
            state.textVerticalPositions = item.textVerticalPositions;
            state.transforms = item.transforms;
            
            // Wait for image reload to trigger render
            state.baseImageElement.onload = () => {
                showFeedback('Arte restaurada com sucesso!', 'success');
                renderApp();
            };
            state.baseImageElement.src = state.baseImage;
            
            schedulePersist();
            window.closeHistoryModal();
        }
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
        textarea.value = state.headlines[formatId];
        textarea.focus();
        textarea.select();
        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

window.updateHeadline = (event, formatId) => {
    state.headlines[formatId] = event.target.value;
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
    schedulePersist();
};

window.finishHeadlineEdit = (event, formatId) => {
    state.headlines[formatId] = event.target.value;
    schedulePersist();
    renderApp(); // Re-render all previews with the new headline
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

window.handleGlobalKeydown = (event) => {
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
        
        // Add Safe Area restrictions (margin)
        const safeAreaMarginPercent = 0.05; // 5% minimum from top or bottom
        const marginPx = preview.offsetHeight * safeAreaMarginPercent;
        
        const absoluteMinTop = marginPx;
        const absoluteMaxTop = preview.offsetHeight - box.offsetHeight - marginPx;
        
        // Ensure box fits. If it doesn't fit with margins, relax restraints
        const usableMinTop = Math.min(absoluteMinTop, absoluteMaxTop < absoluteMinTop ? 0 : absoluteMinTop);
        const usableMaxTop = Math.max(absoluteMaxTop, absoluteMaxTop < absoluteMinTop ? preview.offsetHeight - box.offsetHeight : absoluteMaxTop);

        let newTop = dragContext.initialTop + deltaY;
        newTop = Math.max(usableMinTop, Math.min(newTop, usableMaxTop));
        box.style.top = `${newTop}px`;
        
        // Calculate percentage within the FULL safe area range (not the absolute range)
        const range = usableMaxTop - usableMinTop;
        const newPercentage = range > 0 ? (newTop - usableMinTop) / range : 0.5;
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

// --- CONTRAST ANALYSIS FUNCTION ---
// NOTE: analyzeContrast was removed (BUG-018) because it referenced state.cropData
// which no longer exists. The contrastBoost flag in state is still respected by the
// canvas export engine — it just can't be auto-detected anymore.

// --- HTML TEMPLATE FUNCTIONS ---

const WelcomeScreen = () => {
    let statsHtml = '';
    if (window.historyService) {
        const stats = window.historyService.getStats();
        if (stats.artsGenerated > 0) {
            const hours = Math.floor(stats.timeSavedMinutes / 60);
            const minutes = stats.timeSavedMinutes % 60;
            let timeStr = '';
            if (hours > 0) timeStr += `${hours}h `;
            if (minutes > 0 || hours === 0) timeStr += `${minutes}m`;
            
            statsHtml = `
                <div class="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 w-full max-w-sm flex flex-col items-center text-center shadow-lg transform transition-all hover:scale-105">
                    <span class="text-3xl mb-2 block">🚀</span>
                    <h3 class="text-amber-400 font-bold text-lg mb-1">Seu Impacto</h3>
                    <p class="text-white text-sm">Você já gerou <strong class="text-amber-400 text-lg">${stats.artsGenerated}</strong> artes.</p>
                    <p class="text-zinc-400 text-xs mt-1">Isso economizou aprox. <strong class="text-white">${timeStr}</strong> de trabalho manual!</p>
                </div>
            `;
        }
    }

    return `
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
                <div class="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm">
                    <button onclick="openHistoryModal()" class="flex-1 bg-zinc-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 border border-zinc-700 flex items-center justify-center gap-2 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Histórico
                    </button>
                </div>
                ${statsHtml}
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
                        <div><p class="font-bold text-white">3. Edite a manchete</p><p class="text-zinc-400">Clique no texto sobre a imagem para editar a manchete. Use <code>**negrito**</code>, <code>*itálico*</code> ou <code>$$verde$$</code> para destacar partes específicas.</p></div>
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
};

const ImagePreview = (format) => {
    const transform = state.transforms[format.id];
    const isCropping = state.croppingFormatId === format.id;
    const imageMetrics = getPreviewImageMetrics(format, transform);
    
    const previewWidth = Math.min(window.innerWidth - 32, 640);
    const scaleFactor = previewWidth / format.width;
    
    const templateStyles = constants.TEMPLATES[state.templateId];

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
                    ${format.id === 'instagram-story' ? `
                    <!-- Instagram Story Safe Zones -->
                    <div class="absolute inset-x-0 top-0 h-[10%] border-b border-dashed border-white/20 bg-black/20 pointer-events-none z-30 flex items-start justify-center pt-4">
                        <span class="text-white/50 text-xs font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/10 blur-[0.5px]">Área do Perfil (Evite Textos)</span>
                    </div>
                    <div class="absolute inset-x-0 bottom-0 h-[20%] border-t border-dashed border-white/20 bg-black/20 pointer-events-none z-30 flex items-end justify-center pb-8">
                        <span class="text-white/50 text-xs font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/10 blur-[0.5px]">Área de Interação (Evite Textos)</span>
                    </div>
                    ` : ''}
                    
                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.GLASS_BOX ? `
                    <div id="headline-box-${format.id}" class="absolute w-[87.59%] left-[6.2%]" onmousedown="startDrag(event, 'text', '${format.id}')" ontouchstart="startDrag(event, 'text', '${format.id}')">
                         <div class="rounded-2xl cursor-grab flex items-center relative group transition-all duration-300" 
                              style="padding: ${scaleFactor * 40}px; background-color: ${templateStyles.backgroundColor}; backdrop-filter: ${state.contrastBoost[format.id] ? 'blur(12px) brightness(0.6)' : 'blur(4px)'}; -webkit-backdrop-filter: ${state.contrastBoost[format.id] ? 'blur(12px) brightness(0.6)' : 'blur(4px)'}; ${state.contrastBoost[format.id] ? 'box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);' : ''}">

                            ${format.hasLogo ? `<div style="width:${scaleFactor * 140}px; height:${scaleFactor * 140}px; margin-right:${scaleFactor * 20}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            <div class="flex-grow min-w-0 flex flex-col items-start text-left relative">
                                <button aria-label="Copiar texto para os outros formatos" onclick="syncHeadline(event, '${format.id}')" class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-black p-1 rounded-full shadow-md z-20 hover:bg-amber-500 hover:scale-110 active:scale-95 text-xs font-bold" title="Copiar este texto para os demais formatos">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                ${state.showEyebrowInput && state.eyebrow ? `<div class="block w-full text-left uppercase tracking-[0.18em] mb-2" style="color: ${templateStyles.eyebrowColor}; font-size:${scaleFactor * 18}px; line-height:${scaleFactor * 24}px;">${state.eyebrow}</div>` : ''}
                                <div id="headline-text-${format.id}" class="block w-full text-left" onclick="startHeadlineEdit('${format.id}')" style="color: ${templateStyles.textColor}; font-size:${scaleFactor * 50}px; line-height:${scaleFactor * 60}px; text-align: left;">
                                    ${renderRichTextHtml(state.headlines[format.id])}
                                </div>
                                <textarea id="headline-textarea-${format.id}" oninput="updateHeadline(event, '${format.id}')" onblur="finishHeadlineEdit(event, '${format.id}')" 
                                    class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0" 
                                    style="color: ${templateStyles.textColor}; display: none; font-size:${scaleFactor * 50}px; line-height:${scaleFactor * 60}px; text-align: left;"></textarea>
                                ${state.showSubtitleInput && state.subtitle ? `<div class="block w-full text-left mt-3" style="color: ${templateStyles.subtitleColor}; font-size:${scaleFactor * 28}px; line-height:${scaleFactor * 36}px;">${renderRichTextHtml(state.subtitle)}</div>` : ''}
                            </div>
                        </div>
                    </div>` : ''}

                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.GRADIENT ? `
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 directly-to-transparent pointer-events-none" style="top: calc(${imageMetrics ? imageMetrics.topPercent : 0}% + ${(transform.position.y || 0) * 10}px);"></div>
                    <div id="headline-box-${format.id}" class="absolute w-[87.59%] left-[6.2%]" onmousedown="startDrag(event, 'text', '${format.id}')" ontouchstart="startDrag(event, 'text', '${format.id}')">
                         <div class="cursor-grab flex flex-col items-start relative group" style="padding: ${scaleFactor * 20}px;">
                            ${format.hasLogo ? `<div style="width:${scaleFactor * 100}px; height:${scaleFactor * 100}px; margin-bottom:${scaleFactor * 20}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            <button aria-label="Copiar texto para os outros formatos" onclick="syncHeadline(event, '${format.id}')" class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-black p-1 rounded-full shadow-md z-20 hover:bg-amber-500 hover:scale-110 active:scale-95 text-xs font-bold" title="Copiar este texto para os demais formatos">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                            ${state.showEyebrowInput && state.eyebrow ? `<div class="block w-full text-left uppercase tracking-[0.2em] mb-3 font-bold" style="color: ${templateStyles.eyebrowColor}; font-size:${scaleFactor * 20}px; line-height:${scaleFactor * 26}px;">${state.eyebrow}</div>` : ''}
                            <div id="headline-text-${format.id}" class="block w-full text-left" onclick="startHeadlineEdit('${format.id}')" style="color: ${templateStyles.textColor}; font-size:${scaleFactor * 65}px; line-height:${scaleFactor * 75}px; text-align: left; font-weight: 700; text-shadow: 0px 4px 12px rgba(0,0,0,0.5);">
                                ${renderRichTextHtml(state.headlines[format.id])}
                            </div>
                            <textarea id="headline-textarea-${format.id}" oninput="updateHeadline(event, '${format.id}')" onblur="finishHeadlineEdit(event, '${format.id}')" 
                                class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 font-bold" 
                                style="color: ${templateStyles.textColor}; display: none; font-size:${scaleFactor * 65}px; line-height:${scaleFactor * 75}px; text-align: left; text-shadow: 0px 4px 12px rgba(0,0,0,0.5);"></textarea>
                            ${state.showSubtitleInput && state.subtitle ? `<div class="block w-full text-left mt-4" style="color: ${templateStyles.subtitleColor}; font-size:${scaleFactor * 32}px; line-height:${scaleFactor * 42}px; text-shadow: 0px 2px 8px rgba(0,0,0,0.8);">${renderRichTextHtml(state.subtitle)}</div>` : ''}
                        </div>
                    </div>` : ''}

                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.QUOTE ? `
                    <div class="absolute inset-0 bg-black/60 pointer-events-none"></div>
                    <div id="headline-box-${format.id}" class="absolute w-[87.59%] left-[6.2%]" onmousedown="startDrag(event, 'text', '${format.id}')" ontouchstart="startDrag(event, 'text', '${format.id}')">
                         <div class="cursor-grab flex flex-col items-center justify-center relative group text-center" style="padding: ${scaleFactor * 40}px;">
                            <button aria-label="Copiar texto para os outros formatos" onclick="syncHeadline(event, '${format.id}')" class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-black p-1 rounded-full shadow-md z-20 hover:bg-amber-500 hover:scale-110 active:scale-95 text-xs font-bold" title="Copiar este texto para os demais formatos">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                            <svg class="mb-4 text-amber-400 opacity-80" style="width: ${scaleFactor * 80}px; height: ${scaleFactor * 80}px;" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                            <div id="headline-text-${format.id}" class="block w-full" onclick="startHeadlineEdit('${format.id}')" style="color: ${templateStyles.textColor}; font-size:${scaleFactor * 45}px; line-height:${scaleFactor * 55}px; text-align: center; font-style: italic; font-weight: 700;">
                                ${renderRichTextHtml(state.headlines[format.id])}
                            </div>
                            <textarea id="headline-textarea-${format.id}" oninput="updateHeadline(event, '${format.id}')" onblur="finishHeadlineEdit(event, '${format.id}')" 
                                class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-center" 
                                style="color: ${templateStyles.textColor}; display: none; font-size:${scaleFactor * 45}px; line-height:${scaleFactor * 55}px; font-style: italic; font-weight: 700;"></textarea>
                            <div class="w-16 h-1 mt-6 mb-4 bg-amber-400"></div>
                            ${state.showEyebrowInput && state.eyebrow ? `<div class="block w-full font-bold uppercase tracking-widest" style="color: ${templateStyles.eyebrowColor}; font-size:${scaleFactor * 22}px; line-height:${scaleFactor * 28}px;">${state.eyebrow}</div>` : ''}
                            ${state.showSubtitleInput && state.subtitle ? `<div class="block w-full mt-2" style="color: ${templateStyles.subtitleColor}; font-size:${scaleFactor * 24}px; line-height:${scaleFactor * 32}px;">${renderRichTextHtml(state.subtitle)}</div>` : ''}
                        </div>
                    </div>` : ''}
                    
                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.INFOGRAPHIC ? `
                    <div class="absolute inset-0 bg-black/40 pointer-events-none"></div>
                    <div id="headline-box-${format.id}" class="absolute w-[87.59%] left-[6.2%]" onmousedown="startDrag(event, 'text', '${format.id}')" ontouchstart="startDrag(event, 'text', '${format.id}')">
                         <div class="cursor-grab flex flex-col items-center justify-center relative group text-center" style="padding: ${scaleFactor * 30}px;">
                            ${format.hasLogo ? `<div style="width:${scaleFactor * 100}px; height:${scaleFactor * 100}px; margin-bottom:${scaleFactor * 20}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            <button aria-label="Copiar texto para os outros formatos" onclick="syncHeadline(event, '${format.id}')" class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-black p-1 rounded-full shadow-md z-20 hover:bg-amber-500 hover:scale-110 active:scale-95 text-xs font-bold" title="Copiar este texto para os demais formatos">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                            ${state.showEyebrowInput && state.eyebrow ? `<div class="block w-full font-bold tracking-tight mb-2" style="color: ${templateStyles.eyebrowColor}; font-size:${scaleFactor * 140}px; line-height:${scaleFactor * 140}px; text-shadow: 0px 4px 12px rgba(0,0,0,0.5);">${state.eyebrow}</div>` : ''}
                            <div id="headline-text-${format.id}" class="block w-full font-bold uppercase tracking-wider" onclick="startHeadlineEdit('${format.id}')" style="color: ${templateStyles.textColor}; font-size:${scaleFactor * 35}px; line-height:${scaleFactor * 42}px; text-align: center;">
                                ${renderRichTextHtml(state.headlines[format.id])}
                            </div>
                            <textarea id="headline-textarea-${format.id}" oninput="updateHeadline(event, '${format.id}')" onblur="finishHeadlineEdit(event, '${format.id}')" 
                                class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-bold uppercase tracking-wider text-center" 
                                style="color: ${templateStyles.textColor}; display: none; font-size:${scaleFactor * 35}px; line-height:${scaleFactor * 42}px;"></textarea>
                            ${state.showSubtitleInput && state.subtitle ? `<div class="block w-full mt-4" style="color: ${templateStyles.subtitleColor}; font-size:${scaleFactor * 26}px; line-height:${scaleFactor * 34}px; background-color: rgba(0,0,0,0.5); padding: ${scaleFactor * 8}px ${scaleFactor * 16}px; border-radius: ${scaleFactor * 20}px; display: inline-block;">${renderRichTextHtml(state.subtitle)}</div>` : ''}
                        </div>
                    </div>` : ''}
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
        <button aria-label="Histórico de Artes" onclick="openHistoryModal()" class="bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 border border-zinc-700">Histórico</button>
        <button aria-label="Escolher nova imagem" onclick="handleNewImage()" class="flex-1 sm:flex-none bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400">Nova Imagem</button>
        <button aria-label="Exportar todos os formatos" onclick="openExportModal()" class="flex-1 sm:flex-none bg-amber-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">Exportar Todos</button>
    </footer>
`;

const EditorPanel = () => `
    <section class="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 w-full overflow-hidden">
        <div class="flex flex-col gap-4">
            <div class="w-full">
                <h2 class="text-lg font-bold text-white mb-2">Modelos de Arte</h2>
                <div class="flex flex-nowrap sm:flex-wrap gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar" style="scroll-snap-type: x mandatory;">
                    ${Object.values(constants.TEMPLATES).map((template) => {
                        const isGlassBox = template.layoutType === constants.LAYOUT_TYPE.GLASS_BOX;
                        const bgColor = isGlassBox && template.backgroundColor ? template.backgroundColor.replace('0.85', '1').replace('0.5', '1') : 'transparent';
                        const dotStyle = isGlassBox ? `style="background-color: ${bgColor};"` : '';
                        
                        const isActive = state.templateId === template.id;
                        const activeClass = isActive
                            ? 'bg-amber-400 text-black border border-amber-400'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700';
                        return `
                        <button aria-label="Aplicar template ${template.name}" onclick="handleTemplateChange('${template.id}')" 
                                class="px-5 py-3 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center gap-2 flex-shrink-0 ${activeClass}" style="scroll-snap-align: start;">
                            ${isGlassBox ? `<div class="w-3 h-3 rounded-full border border-black/20" ${dotStyle}></div>` : ''}
                            ${!isGlassBox ? `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            ` : ''}
                            ${template.name}
                        </button>
                    `}).join('')}
                </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
                ${!state.showEyebrowInput ? `
                    <button onclick="toggleEyebrowInput()" class="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                        ${constants.TEMPLATES[state.templateId].layoutType === constants.LAYOUT_TYPE.QUOTE ? 'Adicionar Nome do Entrevistado' : 'Adicionar Editoria (ex: IFMG)'}
                    </button>
                ` : ''}
                ${!state.showSubtitleInput ? `
                    <button onclick="toggleSubtitleInput()" class="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                        Adicionar Subtítulo / Apoio
                    </button>
                ` : ''}
            </div>

            ${state.showEyebrowInput || state.showSubtitleInput ? `
                <div class="grid gap-4 sm:grid-cols-2 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                    ${state.showEyebrowInput ? `
                        <label class="block">
                            <div class="flex justify-between items-center mb-1">
                                <span class="block text-sm font-medium text-zinc-300">
                                    ${constants.TEMPLATES[state.templateId].layoutType === constants.LAYOUT_TYPE.QUOTE ? 'Nome do Entrevistado' : 'Editoria / Sobretítulo'}
                                </span>
                                <button onclick="toggleEyebrowInput()" class="text-zinc-500 hover:text-red-400 transition-colors" title="Remover Campo">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                                </button>
                            </div>
                            <input aria-label="Editar sobtext" type="text" value="${state.eyebrow}" oninput="handleEyebrowChange(event)" onblur="commitMetadataChanges()" class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ex: IFMG, 1º LUGAR, Nome" />
                        </label>
                    ` : ''}
                    
                    ${state.showSubtitleInput ? `
                        <label class="block">
                            <div class="flex justify-between items-center mb-1">
                                <span class="block text-sm font-medium text-zinc-300">Subtítulo</span>
                                <button onclick="toggleSubtitleInput()" class="text-zinc-500 hover:text-red-400 transition-colors" title="Remover Subtítulo">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                                </button>
                            </div>
                            <textarea aria-label="Editar subtítulo" oninput="handleSubtitleChange(event)" onblur="commitMetadataChanges()" rows="1" class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" placeholder="${constants.TEMPLATES[state.templateId].subtitle}">${state.subtitle}</textarea>
                        </label>
                    ` : ''}
                </div>
            ` : ''}
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

const HistoryModal = () => `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in p-4">
        <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Histórico de Artes</h2>
                <button aria-label="Fechar histórico" onclick="closeHistoryModal()" class="text-zinc-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div class="flex-grow overflow-y-auto pr-2 space-y-4">
                ${state.historyItems.length === 0 ? `
                    <div class="text-center py-10 text-zinc-500">
                        <p>Nenhuma arte foi exportada ainda.</p>
                        <p class="text-sm mt-2">Exportar uma arte salvará um rascunho automaticamente aqui.</p>
                    </div>
                ` : state.historyItems.map(item => {
                    const date = new Date(item.timestamp).toLocaleString('pt-BR');
                    // Get a snippet of the headline. We pick the INSTA_POST headline or the first one available
                    const firstHeadline = Object.values(item.headlines || {})[0] || 'Sem título';
                    const headlineSnippet = firstHeadline.length > 50 ? firstHeadline.substring(0, 50) + '...' : firstHeadline;
                    const templateName = constants.TEMPLATES[item.templateId]?.name || 'Template Desconhecido';
                    
                    return `
                    <div class="bg-black border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div class="w-16 h-16 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0" style="background-image: url('${item.baseImage}'); background-size: cover; background-position: center;"></div>
                        <div class="flex-grow text-left">
                            <h3 class="font-bold text-amber-400 text-lg break-all">${item.slug || 'Sem identificador'}</h3>
                            <p class="text-white text-sm mt-1 max-w-md line-clamp-2">${headlineSnippet}</p>
                            <p class="text-zinc-500 text-xs mt-2">${date} &bull; ${templateName}</p>
                        </div>
                        <div class="mt-4 sm:mt-0 ml-auto flex-shrink-0">
                            <button aria-label="Restaurar este rascunho" onclick="restoreHistoryItem(${item.id})" class="bg-zinc-800 text-white px-4 py-2 rounded font-semibold hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-400 transition-colors text-sm w-full sm:w-auto">
                                Restaurar
                            </button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
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
                        const safeAreaMarginPercent = 0.05; // 5% minimum from top or bottom
                        const marginPx = preview.offsetHeight * safeAreaMarginPercent;
                        const absoluteMinTop = marginPx;
                        const absoluteMaxTop = preview.offsetHeight - box.offsetHeight - marginPx;
                        
                        const usableMinTop = Math.min(absoluteMinTop, absoluteMaxTop < absoluteMinTop ? 0 : absoluteMinTop);
                        const usableMaxTop = Math.max(absoluteMaxTop, absoluteMaxTop < absoluteMinTop ? preview.offsetHeight - box.offsetHeight : absoluteMaxTop);

                        const range = usableMaxTop - usableMinTop;
                        const topPosition = range > 0 ? usableMinTop + (state.textVerticalPositions[format.id] * range) : usableMinTop;
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
    } else if (state.showHistoryModal) {
        modalContainerElement.innerHTML = HistoryModal();
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
    
    // Support legacy persistence (headline -> string) vs new (headlines -> object)
    if (persistedState.headlines) {
        state.headlines = persistedState.headlines;
    } else if (persistedState.headline) {
         state.headlines = Object.values(constants.FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: persistedState.headline }), {});
    }
    
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
