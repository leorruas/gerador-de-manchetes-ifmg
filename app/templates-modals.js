// Templates HTML de modais e feedback visual.
(() => {
const { constants, state } = window.mancheteApp;
const ExportModal = () => `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-black border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-lg w-[calc(100%-1.5rem)] max-w-sm text-center">
            <h2 class="text-2xl font-bold mb-4">${state.exportFormatIds.length === 1 ? 'Exportar Formato' : 'Exportar Imagens'}</h2>
            <div class="w-full mb-6">
                <label for="slug-input" class="block text-sm font-medium text-zinc-400 mb-2 text-left">Nome do arquivo (slug)</label>
                <input type="text" id="slug-input" value="${state.slug}" data-action="handleSlugChange"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="ex: semana-de-calouros">
            </div>
            <p class="text-zinc-400 mb-2">${state.exportFormatIds.length === 1 ? constants.FORMATS[state.exportFormatIds[0]].name : 'Todos os formatos selecionados serão exportados.'}</p>
            <p class="text-zinc-400 mb-6">Escolha o formato de exportação:</p>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button aria-label="Exportar em PNG" data-action="handleExport" data-type="png" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200">PNG</button>
                <button aria-label="Exportar em JPG" data-action="handleExport" data-type="jpeg" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200">JPG</button>
            </div>
            <button aria-label="Cancelar exportação" data-action="closeExportModal" class="mt-6 text-red-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 rounded">Cancelar</button>
        </div>
    </div>
`;

const BatchExportModal = () => `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in px-4">
        <div class="bg-black border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-lg w-full max-w-sm text-center">
            <h2 class="text-2xl font-bold mb-3">Exportar Todas as Imagens</h2>
            <p class="text-amber-400 font-semibold mb-4 text-sm">${state.slides.length} slides detectados.</p>
            <p class="text-zinc-400 mb-6 text-sm">Download automático de todos os slides no${state.batchExportFormatIds.length === 1 ? ` formato <b>${constants.FORMATS[state.batchExportFormatIds[0]].name}</b>.` : 's formatos <b>Instagram Post</b> e <b>Stories</b>.'}</p>
            <div class="flex flex-col gap-3">
                <button aria-label="Exportar Lote em PNG" data-action="handleBatchExport" data-type="png" class="w-full bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none flex justify-center items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Baixar PNGs
                </button>
                <button aria-label="Exportar Lote em JPG" data-action="handleBatchExport" data-type="jpeg" class="w-full bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none flex justify-center items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Baixar JPGs
                </button>
            </div>
            <button aria-label="Cancelar exportação de Lote" data-action="closeBatchExportModal" class="mt-6 text-zinc-500 hover:text-red-400 transition-colors focus:outline-none rounded text-sm">Cancelar</button>
        </div>
    </div>
`;

const HistoryModal = () => `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in p-4">
        <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Histórico de Artes</h2>
                <button aria-label="Fechar histórico" data-action="closeHistoryModal" class="text-zinc-400 hover:text-white transition-colors">
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
                            <button aria-label="Restaurar este rascunho" data-action="restoreHistoryItem" data-id="${item.id}" class="bg-zinc-800 text-white px-4 py-2 rounded font-semibold hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-400 transition-colors text-sm w-full sm:w-auto">
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

const SlideToolbar = () => { return ''; };
window.mancheteTemplates = { ...(window.mancheteTemplates || {}), ExportModal, BatchExportModal, HistoryModal, FeedbackBanner, SlideToolbar };
})();
