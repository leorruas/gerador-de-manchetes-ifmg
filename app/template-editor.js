// Painel de selecao de modelos e campos opcionais de metadados.
(() => {
const { constants, state } = window.mancheteApp;
const ControlsBar = () => `
    <footer class="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-zinc-800 p-2 z-50" style="padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));">
      <div class="max-w-2xl mx-auto flex flex-row items-stretch gap-2">
        <button aria-label="Escolher nova imagem" data-action="handleNewImage" class="flex-1 bg-zinc-800 text-white text-xs font-semibold py-2 px-2 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 border border-zinc-700">Novo Post</button>
        <button aria-label="Exportar"
            data-action="${state.slides && state.slides.length > 1 ? 'openBatchExportModal' : 'openExportModal'}" 
            class="flex-1 bg-amber-400 text-black text-xs font-bold py-2 px-2 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">
            ${state.slides && state.slides.length > 1 ? 'Exportar Tudo' : 'Exportar'}
        </button>
      </div>
    </footer>
`;

const EditorPanel = () => {
    const isCarousel = state.slides && state.slides.length > 1;
    const isCarouselStory = state.templateId === constants.TEMPLATE_ID.CAROUSEL_STORY;
    const storyLayoutMode = state.storyLayoutMode ? Object.values(state.storyLayoutMode)[0] || 'gradient_bottom' : 'gradient_bottom';
    const colorPicker = (label, value, action) => `
        <label class="relative flex flex-1 min-w-[8rem] items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 p-3 cursor-pointer hover:bg-zinc-800 transition-colors focus-within:ring-2 focus-within:ring-amber-400">
            <span class="h-10 w-10 rounded-lg border border-white/20 shadow-md flex-shrink-0" style="background-color: ${value};"></span>
            <span class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-white">${label}</span>
                <span class="text-[10px] font-mono uppercase text-zinc-400">${value}</span>
            </span>
            <input type="color" value="${value}" data-action="${action}" class="absolute inset-0 h-full w-full opacity-0 cursor-pointer">
        </label>
    `;

    return `
    <section class="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 w-full overflow-hidden">
        <div class="flex flex-col gap-4">
            <div class="w-full">
                <h2 class="text-lg font-bold text-white mb-2">Modelos de Arte</h2>
                <div class="flex flex-nowrap sm:flex-wrap gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar" style="scroll-snap-type: x mandatory;">
                    ${Object.values(constants.TEMPLATES).map((template) => {
                        if (isCarousel && template.id !== constants.TEMPLATE_ID.CAROUSEL_STORY) return '';
                        if (!isCarousel && template.id === constants.TEMPLATE_ID.CAROUSEL_STORY) return '';
                        const isGlassBox = template.layoutType === constants.LAYOUT_TYPE.GLASS_BOX;
                        const bgColor = isGlassBox && template.backgroundColor ? template.backgroundColor.replace('0.85', '1').replace('0.5', '1') : 'transparent';
                        
                        const isActive = state.templateId === template.id;
                        const activeClass = isActive
                            ? 'bg-amber-400 text-black border border-amber-400'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700';
                        
                        const dotHtml = isGlassBox ? '<div class="w-3 h-3 rounded-full border border-black/20" style="background-color: ' + bgColor + ';"></div>' : '';
                        const iconHtml = !isGlassBox ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>' : '';
                        
                        return '<button aria-label="Aplicar template ' + template.name + '" data-action="handleTemplateChange" data-template-id="' + template.id + '" class="px-5 py-3 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center gap-2 flex-shrink-0 ' + activeClass + '" style="scroll-snap-align: start;">' + dotHtml + iconHtml + template.name + '</button>';
                    }).join('')}
                </div>

                ${isCarouselStory ? `
                <div class="border-t border-zinc-800 pt-4 mt-2 mb-2">
                    <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        Cores do Título
                    </h3>
                    <div class="flex flex-col sm:flex-row gap-3">
                        ${colorPicker('Slides ímpares', state.storyColor1, 'handleStoryColor1')}
                        ${colorPicker('Slides pares', state.storyColor2, 'handleStoryColor2')}
                    </div>
                    <p class="text-[10px] text-zinc-500 mt-2">Alterna a cor do título entre slides.</p>
                </div>
                ` : ''}

                <div class="flex items-center justify-between border-t border-zinc-800 pt-4 mt-2">
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sincronizar formatos
                        </span>
                        <p class="text-[10px] text-zinc-500">${isCarouselStory ? 'Mudar a editoria em um formato sincroniza todos.' : 'Mudar o texto em um formato altera todos os outros.'}</p>
                    </div>
                    <button data-action="toggleAutoSync" class="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${state.autoSync ? 'bg-amber-400 text-black hover:bg-amber-500' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}">
                        ${state.autoSync ? 'Sincronizado' : 'Independente'}
                    </button>
                </div>
            </div>
        </div>
    </section>
`;
};
window.mancheteTemplates = { ...(window.mancheteTemplates || {}), ControlsBar, EditorPanel };
})();
