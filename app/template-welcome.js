// Tela inicial, area de upload e instrucoes resumidas.
(() => {
const { constants } = window.mancheteApp;
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
                <label id="dropzone" for="image-upload" data-dropzone="true"
                    class="w-full p-8 sm:p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900">
                    ${constants.UploadIcon}
                    <p class="mt-4 font-semibold text-white">Arraste e solte uma imagem aqui</p>
                    <p class="text-sm text-zinc-400">ou clique para selecionar</p>
                </label>
                <div class="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm">
                    <button data-action="openHistoryModal" class="flex-1 bg-zinc-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 border border-zinc-700 flex items-center justify-center gap-2 shadow-lg">
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
                        <div><p class="font-bold text-white">1. Envie uma ou várias imagens</p><p class="text-zinc-400">Arraste os arquivos para a área indicada ou clique para escolher (JPG, PNG, WebP).</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Crop}</div>
                        <div><p class="font-bold text-white">2. Preencha ou Ajuste</p><p class="text-zinc-400">Navegue pelas miniaturas e clique em "Ajustar à tela" ou "Preencher a tela" para moldar a imagem perfeitamente ao formato. Use o ícone de crop para pan e zoom.</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Edit}</div>
                        <div><p class="font-bold text-white">3. Edite ou Oculte a manchete</p><p class="text-zinc-400">Clique na manchete para escrever ou decida exportar uma arte "limpa" (Apenas Imagem, sem textos soltos).</p></div>
                    </li>
                    <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Drag}</div>
                        <div><p class="font-bold text-white">4. Ajuste espacial livre</p><p class="text-zinc-400">Se for postar manchete, arraste o bloco de texto inteiro verticalmente para não tampar rostos na arte.</p></div>
                    </li>
                     <li class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">${constants.StepIcon.Export}</div>
                        <div><p class="font-bold text-white">5. Exporte em Carrossel/Lote</p><p class="text-zinc-400">Clique no botão Exportar para gerar o seu post ou baixar individualmente como um único pacote de imagens otimizado!</p></div>
                    </li>
                </ol>
            </div>
        </div>
    </div>
    `;
};
window.mancheteTemplates = { ...(window.mancheteTemplates || {}), WelcomeScreen };
})();

