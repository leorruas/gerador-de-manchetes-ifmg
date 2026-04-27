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
            </div>
            
            <div class="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
                ${!state.showEyebrowInput ? `
                    <button data-action="toggleEyebrowInput" class="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                        ${constants.TEMPLATES[state.templateId].layoutType === constants.LAYOUT_TYPE.QUOTE ? 'Adicionar Nome do Entrevistado' : 'Adicionar Editoria (ex: IFMG)'}
                    </button>
                ` : ''}
                ${!state.showSubtitleInput ? `
                    <button data-action="toggleSubtitleInput" class="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition-colors">
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
                                <button data-action="toggleEyebrowInput" class="text-zinc-500 hover:text-red-400 transition-colors" title="Remover Campo">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                                </button>
                            </div>
                            <input aria-label="Editar sobtext" type="text" value="${state.eyebrow}" data-action="handleEyebrowChange" data-blur-action="commitMetadataChanges" class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ex: IFMG, 1º LUGAR, Nome" />
                        </label>
                    ` : ''}
                    
                    ${state.showSubtitleInput ? `
                        <label class="block">
                            <div class="flex justify-between items-center mb-1">
                                <span class="block text-sm font-medium text-zinc-300">Subtítulo</span>
                                <button data-action="toggleSubtitleInput" class="text-zinc-500 hover:text-red-400 transition-colors" title="Remover Subtítulo">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                                </button>
                            </div>
                            <textarea aria-label="Editar subtítulo" data-action="handleSubtitleChange" data-blur-action="commitMetadataChanges" rows="1" class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" placeholder="${constants.TEMPLATES[state.templateId].subtitle}">${state.subtitle}</textarea>
                        </label>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    </section>
`;
window.mancheteTemplates = { ...(window.mancheteTemplates || {}), ControlsBar, EditorPanel };
})();

