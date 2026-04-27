// Painel de selecao de modelos e campos opcionais de metadados.
(() => {
const { constants, state } = window.mancheteApp;
const ControlsBar = () => `
    <footer class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-zinc-800 p-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 z-40">
        <button aria-label="Histórico de Artes" data-action="openHistoryModal" class="bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 border border-zinc-700">Histórico</button>
        <button aria-label="Escolher nova imagem" data-action="handleNewImage" class="flex-1 sm:flex-none bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400">Novo Post</button>
        <button aria-label="Exportar" 
            data-action="${state.slides && state.slides.length > 1 ? 'openBatchExportModal' : 'openExportModal'}" 
            class="flex-1 sm:flex-none bg-amber-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">
            ${state.slides && state.slides.length > 1 ? 'Exportar Todas as Imagens' : 'Exportar Atual'}
        </button>
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
                        <button aria-label="Aplicar template ${template.name}" data-action="handleTemplateChange" data-template-id="${template.id}" 
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

                <div class="flex items-center justify-between border-t border-zinc-800 pt-4 mt-2">
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sincronizar formatos
                        </span>
                        <p class="text-[10px] text-zinc-500">Mudar o texto em um formato altera todos os outros.</p>
                    </div>
                    <button data-action="toggleAutoSync" class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 ${state.autoSync ? 'bg-amber-400' : 'bg-zinc-700'}">
                        <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${state.autoSync ? 'translate-x-5' : 'translate-x-0'}"></span>
                    </button>
                </div>
            </div>
        </div>
    </section>
`;
window.mancheteTemplates = { ...(window.mancheteTemplates || {}), ControlsBar, EditorPanel };
})();

