import { FORMATS, IFMG_LOGO_SVG_STRING, StepIcon, UploadIcon, CropIcon, EditIcon } from './constants.js';
import { generateAndDownloadImage } from './services/canvasExport.js';

// --- APPLICATION STATE ---
let state = {
    baseImage: null,
    baseImageElement: new Image(),
    headline: "Título da notícia ou chamada para a arte",
    slug: "noticia-exemplo",
    textVerticalPositions: {
        [FORMATS.INSTA_POST.id]: 0.5,
        [FORMATS.INSTA_STORY.id]: 0.5,
        [FORMATS.PORTAL_CAMPI.id]: 0.5,
        [FORMATS.PORTAL_PRINCIPAL.id]: 0.5,
    },
    transforms: Object.values(FORMATS).reduce((acc, curr) => ({
        ...acc,
        [curr.id]: { zoom: 1, position: { x: 0, y: 0 } }
    }), {}),
    isCropModalOpen: false,
    croppingFormatId: null,
    showExportModal: false,
};

// --- DOM REFERENCES ---
const appElement = document.getElementById('app');
const modalContainerElement = document.getElementById('modal-container');

// --- EVENT HANDLERS (attached to window for inline HTML access) ---

window.handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.baseImage = event.target.result;
            state.baseImageElement.src = state.baseImage;
            renderApp();
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert("Por favor, envie um arquivo de imagem válido (JPG, PNG, WebP).");
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
    state.headline = "Título da notícia ou chamada para a arte";
    state.slug = "noticia-exemplo";
    state.transforms = Object.values(FORMATS).reduce((acc, curr) => ({ ...acc, [curr.id]: { zoom: 1, position: { x: 0, y: 0 } } }), {});
    renderApp();
};

window.openExportModal = () => {
    state.showExportModal = true;
    renderModals();
};

window.closeExportModal = () => {
    state.showExportModal = false;
    renderModals();
};

window.handleSlugChange = (event) => {
    state.slug = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
    // We can re-render the modal to show the sanitized value
    const input = document.getElementById('slug-input');
    if(input) input.value = state.slug;
};

window.handleExport = async (type) => {
    if (!state.baseImage) return;
    const exportButton = event.target;
    const originalText = exportButton.innerHTML;
    exportButton.disabled = true;
    exportButton.innerHTML = 'Exportando...';

    try {
        for (const format of Object.values(FORMATS)) {
            await generateAndDownloadImage(format, state.baseImageElement, state.transforms[format.id], state.headline, state.textVerticalPositions[format.id], state.slug, type);
        }
    } catch (e) {
        console.error("Export failed:", e);
        alert("Ocorreu um erro durante a exportação. Verifique o console para mais detalhes.");
    } finally {
        exportButton.disabled = false;
        exportButton.innerHTML = originalText;
        window.closeExportModal();
    }
};

window.openCropModal = (formatId) => {
    state.croppingFormatId = formatId;
    state.isCropModalOpen = true;
    renderModals();
};

window.closeCropModal = () => {
    state.isCropModalOpen = false;
    state.croppingFormatId = null;
    renderModals();
};

window.saveCrop = () => {
    const formatId = state.croppingFormatId;
    if (formatId) {
        const zoom = parseFloat(document.getElementById('zoom-slider').value);
        // The position is already updated in the state by the drag handlers
        state.transforms[formatId].zoom = zoom;
    }
    window.closeCropModal();
    renderApp(); // Re-render the main app to show the updated crop
};

window.handleZoomChange = (event) => {
    const zoom = parseFloat(event.target.value);
    const formatId = state.croppingFormatId;
    if(formatId) {
        state.transforms[formatId].zoom = zoom;
        const img = document.getElementById(`crop-image-${formatId}`);
        if (img) {
            const { x, y } = state.transforms[formatId].position;
            img.style.transform = `scale(${zoom}) translate(${x}px, ${y}px)`;
        }
    }
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
};

window.finishHeadlineEdit = (event) => {
    state.headline = event.target.value;
    renderApp(); // Re-render all previews with the new headline
};

// --- Drag Handlers for Text Box and Crop Image ---
let dragContext = {};

function startDrag(event, type, formatId) {
    event.preventDefault();
    dragContext = { type, formatId, startX: event.clientX, startY: event.clientY };
    if (type === 'text') {
        const element = document.getElementById(`headline-box-${formatId}`);
        dragContext.initialTop = element.offsetTop;
        document.body.style.cursor = 'grabbing';
    } else if (type === 'crop') {
        dragContext.initialPosition = { ...state.transforms[formatId].position };
        document.getElementById(`crop-image-container-${formatId}`).style.cursor = 'grabbing';
    }
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
}

function onDrag(event) {
    if (!dragContext.type) return;
    const deltaX = event.clientX - dragContext.startX;
    const deltaY = event.clientY - dragContext.startY;

    if (dragContext.type === 'text') {
        const preview = document.getElementById(`preview-${dragContext.formatId}`);
        const box = document.getElementById(`headline-box-${dragContext.formatId}`);
        const maxTop = preview.offsetHeight - box.offsetHeight;
        let newTop = dragContext.initialTop + deltaY;
        newTop = Math.max(0, Math.min(newTop, maxTop));
        box.style.top = `${newTop}px`;
        const newPercentage = maxTop > 0 ? newTop / maxTop : 0;
        state.textVerticalPositions[dragContext.formatId] = newPercentage;

    } else if (dragContext.type === 'crop') {
        const newPos = {
            x: dragContext.initialPosition.x + deltaX,
            y: dragContext.initialPosition.y + deltaY
        };
        state.transforms[dragContext.formatId].position = newPos;
        const img = document.getElementById(`crop-image-${dragContext.formatId}`);
        const zoom = state.transforms[dragContext.formatId].zoom;
        img.style.transform = `scale(${zoom}) translate(${newPos.x}px, ${newPos.y}px)`;
    }
}

function endDrag() {
    if (dragContext.type === 'text') {
        document.body.style.cursor = 'default';
    } else if (dragContext.type === 'crop' && dragContext.formatId) {
        const container = document.getElementById(`crop-image-container-${dragContext.formatId}`);
        if(container) container.style.cursor = 'grab';
    }
    dragContext = {};
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
}


// --- HTML TEMPLATE FUNCTIONS ---

const WelcomeScreen = () => `
    <div class="flex items-center justify-center min-h-screen p-8">
        <div class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            <div class="flex flex-col items-center text-center">
                <div class="mb-8">
                    <div class="w-32 h-32 mx-auto text-white">${IFMG_LOGO_SVG_STRING}</div>
                    <h1 class="text-5xl font-bold mt-4">MancheteExpress</h1>
                </div>
                <label id="dropzone" for="image-upload" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleFileDrop(event)"
                    class="w-full p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900">
                    ${UploadIcon}
                    <p class="mt-4 font-semibold text-white">Arraste e solte uma imagem aqui</p>
                    <p class="text-sm text-zinc-400">ou clique para selecionar</p>
                    <input id="image-upload" type="file" accept="image/jpeg, image/png, image/webp" class="hidden" onchange="handleImageSelect(event)" />
                </label>
            </div>
            <div class="w-full">
                <h2 class="text-2xl font-bold mb-6 text-center lg:text-left">Como usar:</h2>
                <ol class="space-y-4">
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${StepIcon.Upload}</div>
                        <div><p class="font-bold text-white">1. Envie uma imagem</p><p class="text-zinc-400">Arraste um arquivo para a área indicada ou clique para escolher (JPG, PNG, WebP).</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${StepIcon.Crop}</div>
                        <div><p class="font-bold text-white">2. Reenquadre a imagem</p><p class="text-zinc-400">Use o ícone de alvo em cada preview para abrir o editor, onde você pode ajustar o zoom e a posição da imagem.</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${StepIcon.Edit}</div>
                        <div><p class="font-bold text-white">3. Edite a manchete</p><p class="text-zinc-400">Clique no texto padrão sobre a imagem para escrever a manchete desejada para os formatos de Instagram.</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${StepIcon.Drag}</div>
                        <div><p class="font-bold text-white">4. Ajuste a posição do texto</p><p class="text-zinc-400">Clique e arraste a caixa de texto verticalmente para encontrar a melhor posição em cada formato.</p></div>
                    </li>
                     <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${StepIcon.Export}</div>
                        <div><p class="font-bold text-white">5. Exporte tudo</p><p class="text-zinc-400">Clique em "Exportar Todos", defina um nome de arquivo (slug) e escolha o formato para baixar todas as artes.</p></div>
                    </li>
                </ol>
            </div>
        </div>
    </div>
`;

const ImagePreview = (format) => {
    const transform = state.transforms[format.id];
    const textVPos = state.textVerticalPositions[format.id];
    
    const previewWidth = Math.min(window.innerWidth - 32, 640);
    const scaleFactor = previewWidth / format.width;
    
    return `
        <div class="mb-8 last:mb-0">
            <h3 class="text-lg font-bold text-zinc-400 mb-2">${format.name} (${format.width}x${format.height})</h3>
            <div id="preview-${format.id}" class="relative bg-black rounded-lg overflow-hidden shadow-lg w-full" style="aspect-ratio: ${format.width} / ${format.height}">
                <img src="${state.baseImage}" alt="Preview" class="absolute top-0 left-0 w-full h-full object-cover" 
                     style="transform: scale(${transform.zoom}) translate(${transform.position.x}px, ${transform.position.y}px);">

                ${format.hasText ? `
                    <div id="headline-box-${format.id}" class="absolute w-[87.59%] left-[6.2%]" style="transform: translateY(0);" onmousedown="startDrag(event, 'text', '${format.id}')">
                         <div class="bg-black/50 backdrop-blur-sm rounded-2xl cursor-grab flex items-center" style="padding: ${scaleFactor * 60}px">
                            ${format.hasLogo ? `<div style="width:${scaleFactor * 100}px; height:${scaleFactor * 100}px; margin-right:${scaleFactor * 20}px" class="flex-shrink-0">${IFMG_LOGO_SVG_STRING}</div>` : ''}
                            <div class="flex-grow">
                                <div id="headline-text-${format.id}" class="text-white font-bold" onclick="startHeadlineEdit('${format.id}')" style="font-size:${scaleFactor * 50}px; line-height:${scaleFactor * 60}px;">
                                    ${state.headline.replace(/\n/g, '<br>') || '&nbsp;'}
                                </div>
                                <textarea id="headline-textarea-${format.id}" oninput="updateHeadline(event)" onblur="finishHeadlineEdit(event)" 
                                    class="w-full bg-transparent text-white font-bold resize-none border-none outline-none focus:ring-0 p-0" 
                                    style="display: none; font-size:${scaleFactor * 50}px; line-height:${scaleFactor * 60}px;"></textarea>
                            </div>
                        </div>
                    </div>
                ` : ''}
                 <button onclick="openCropModal('${format.id}')" class="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/75 transition-colors">
                     ${CropIcon}
                 </button>
            </div>
        </div>
    `;
};

const ControlsBar = () => `
    <footer class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-zinc-800 p-4 flex justify-center items-center gap-4 z-10">
        <button onclick="handleNewImage()" class="bg-zinc-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors">Nova Imagem</button>
        <button onclick="openExportModal()" class="bg-amber-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-amber-500 transition-colors">Exportar Todos</button>
    </footer>
`;

const ExportModal = () => `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-black border border-zinc-800 rounded-xl p-8 shadow-lg w-full max-w-sm text-center">
            <h2 class="text-2xl font-bold mb-4">Exportar Imagens</h2>
            <div class="w-full mb-6">
                <label for="slug-input" class="block text-sm font-medium text-zinc-400 mb-2 text-left">Nome do arquivo (slug)</label>
                <input type="text" id="slug-input" value="${state.slug}" oninput="handleSlugChange(event)"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="ex: semana-de-calouros">
            </div>
            <p class="text-zinc-400 mb-6">Escolha o formato de exportação:</p>
            <div class="flex gap-4">
                <button onclick="handleExport('png', event)" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50">PNG</button>
                <button onclick="handleExport('jpeg', event)" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50">JPG</button>
            </div>
            <button onclick="closeExportModal()" class="mt-6 text-red-500 hover:text-red-400 transition-colors">Cancelar</button>
        </div>
    </div>
`;

const CropModal = () => {
    const format = FORMATS[state.croppingFormatId];
    if (!format) return '';
    const transform = state.transforms[format.id];

    return `
        <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div class="bg-black border border-zinc-800 rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-zinc-800 flex-shrink-0">
                    <h2 class="text-xl font-bold text-center">Reenquadrar: ${format.name}</h2>
                </div>
                <div class="p-6 flex-1 flex items-center justify-center min-h-0">
                    <div class="relative w-full" style="aspect-ratio: ${format.width} / ${format.height}">
                        <div id="crop-image-container-${format.id}" class="absolute inset-0 w-full h-full overflow-hidden bg-black rounded-lg cursor-grab" onmousedown="startDrag(event, 'crop', '${format.id}')">
                            <img id="crop-image-${format.id}" src="${state.baseImage}" alt="Crop preview" class="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                                 style="transform: scale(${transform.zoom}) translate(${transform.position.x}px, ${transform.position.y}px); transition: transform 0.1s ease-out;">
                        </div>
                        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-xs bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 z-10">
                            ${EditIcon.ZoomOut}
                            <input type="range" id="zoom-slider" min="1" max="3" step="0.01" value="${transform.zoom}" oninput="handleZoomChange(event)"
                                   class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer">
                            ${EditIcon.ZoomIn}
                        </div>
                    </div>
                </div>
                <div class="p-6 border-t border-zinc-800 flex gap-4 flex-shrink-0">
                    <button onclick="closeCropModal()" class="flex-1 bg-zinc-700 text-white font-semibold py-2 rounded-lg hover:bg-zinc-600 transition-colors">Cancelar</button>
                    <button onclick="saveCrop()" class="flex-1 bg-amber-400 text-black font-bold py-2 rounded-lg hover:bg-amber-500 transition-colors">Salvar</button>
                </div>
            </div>
        </div>
    `;
};


// --- RENDER FUNCTIONS ---

function renderApp() {
    if (!appElement) return;

    if (!state.baseImage) {
        appElement.innerHTML = WelcomeScreen();
    } else {
        const previewsHTML = Object.values(FORMATS).map(ImagePreview).join('');
        appElement.innerHTML = `
            <div class="min-h-screen bg-black text-white pb-24">
                <div class="max-w-2xl mx-auto py-8 px-4">
                    ${previewsHTML}
                </div>
                ${ControlsBar()}
            </div>
        `;
        // After rendering, we need to correctly position the text boxes
        // because their height is now known.
        Object.values(FORMATS).forEach(format => {
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
    }
}

function renderModals() {
    if (!modalContainerElement) return;

    if (state.isCropModalOpen) {
        modalContainerElement.innerHTML = CropModal();
    } else if (state.showExportModal) {
        modalContainerElement.innerHTML = ExportModal();
    } else {
        modalContainerElement.innerHTML = '';
    }
}


// --- INITIALIZATION ---
renderApp();