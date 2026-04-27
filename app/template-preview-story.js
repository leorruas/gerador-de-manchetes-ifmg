// Helpers de preview para o template "Historia Completa".
(() => {
function renderStoryLayoutControls(format, storyLayoutMode) {
    const button = (layout, label) => `
        <button data-action="setStoryLayout" data-format-id="${format.id}" data-layout="${layout}" class="px-4 py-2 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${storyLayoutMode === layout ? 'bg-amber-400 text-black shadow-sm' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'}">${label}</button>
    `;
    return `
        <div class="flex flex-col gap-2 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gradiente do slide</div>
            <div class="flex flex-wrap items-center gap-2">
                ${button('gradient_bottom', 'Inferior')}
                ${button('gradient_top', 'Superior')}
                ${button('solid_color', 'Sólido')}
            </div>
        </div>
    `;
}

function renderSlideNavigator(state) {
    return `
        <div class="flex flex-col gap-1 bg-zinc-800 p-2 rounded-xl border border-zinc-700">
            <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Arraste as bolinhas para reordenar</div>
            <div class="flex flex-wrap items-center gap-1.5">
                ${state.slides.map((s, idx) => `
                    <button draggable="true" data-action="handleSlideSwitch" data-slide-id="${s.id}" data-slide-order-id="${s.id}" aria-label="Slide ${idx + 1}. Arraste para reordenar." title="Arraste para reordenar" class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${state.activeSlideId === s.id ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}">${idx + 1}</button>
                `).join('')}
                <button data-action="addSlide" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 transition-colors focus:outline-none" title="Adicionar Foto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                </button>
            </div>
        </div>`;
}

function renderCarouselStoryOverlay(options) {
    const { constants, state, format, gradient, scaleFactor, px, TEXT_BOX, templateStyles, storyLayoutMode, storyColor, storyShadow, storyHeadlineSize, storyLineHeight, storyLogoSize, isFirstSlide, isLastSlide, floatButtonsHtml, renderRichTextHtml } = options;
    return `
        ${storyLayoutMode === 'gradient_bottom' ? `<div class="absolute inset-x-0 bottom-0 pointer-events-none" style="height: 70%; z-index: 1; background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);"></div>` : ''}
        ${storyLayoutMode === 'gradient_top' ? `<div class="absolute inset-x-0 top-0 pointer-events-none" style="height: 60%; z-index: 1; background: linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);"></div>` : ''}
        <div id="headline-box-${format.id}" class="absolute z-10" tabindex="0" aria-label="Mover texto ${format.name}" style="width:${TEXT_BOX.widthRatio * 100}%; left:${TEXT_BOX.leftRatio * 100}%;" data-drag-type="text" data-format-id="${format.id}">
             ${floatButtonsHtml}
             <div class="cursor-grab flex flex-col items-start relative group" style="padding: ${px(scaleFactor, gradient.padding)}px;">
                ${format.hasLogo && isLastSlide ? `<div style="width:${px(scaleFactor, storyLogoSize)}px; height:${px(scaleFactor, storyLogoSize)}px; margin-bottom:${px(scaleFactor, gradient.logoGap)}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                ${state.showEyebrowInput ? `
                    <div id="eyebrow-text-${format.id}" class="block w-full text-left uppercase mb-3 font-bold cursor-text" data-action="startEyebrowEdit" data-format-id="${format.id}" style="letter-spacing:${gradient.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; font-size:${px(scaleFactor, gradient.eyebrowSize)}px; line-height:${px(scaleFactor, gradient.eyebrowLineHeight)}px;">${state.eyebrows[format.id] || 'EDITAR EDITORIA'}</div>
                    <textarea id="eyebrow-textarea-${format.id}" data-action="updateEyebrow" data-blur-action="finishEyebrowEdit" data-format-id="${format.id}" class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 uppercase mb-3 font-bold" style="letter-spacing:${gradient.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; display: none; font-size:${px(scaleFactor, gradient.eyebrowSize)}px; line-height:${px(scaleFactor, gradient.eyebrowLineHeight)}px;"></textarea>
                ` : ''}
                <div id="headline-text-${format.id}" class="block w-full text-left cursor-text" data-action="startHeadlineEdit" data-format-id="${format.id}" style="color: ${storyColor}; font-size:${px(scaleFactor, storyHeadlineSize)}px; line-height:${px(scaleFactor, storyLineHeight)}px; text-align: left; font-weight: 700; font-family: 'Montagu Slab', serif; ${isFirstSlide ? 'text-transform: uppercase;' : ''} text-shadow: ${storyShadow};">${renderRichTextHtml(state.headlines[format.id])}</div>
                <textarea id="headline-textarea-${format.id}" data-action="updateHeadline" data-blur-action="finishHeadlineEdit" data-format-id="${format.id}" class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 font-bold" style="color: ${storyColor}; display: none; font-size:${px(scaleFactor, storyHeadlineSize)}px; line-height:${px(scaleFactor, storyLineHeight)}px; text-align: left; font-family: 'Montagu Slab', serif; ${isFirstSlide ? 'text-transform: uppercase;' : ''} text-shadow: ${storyShadow};"></textarea>
                ${state.showSubtitleInput ? `
                    <div id="subtitle-text-${format.id}" class="block w-full text-left mt-4 cursor-text" data-action="startSubtitleEdit" data-format-id="${format.id}" style="color: ${templateStyles.subtitleColor}; font-size:${px(scaleFactor, gradient.subtitleSize)}px; line-height:${px(scaleFactor, gradient.subtitleLineHeight)}px; text-shadow: ${storyShadow};">${renderRichTextHtml(state.subtitles[format.id]) || 'EDITAR SUBTÍTULO'}</div>
                    <textarea id="subtitle-textarea-${format.id}" data-action="updateSubtitle" data-blur-action="finishSubtitleEdit" data-format-id="${format.id}" class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 mt-4" style="color: ${templateStyles.subtitleColor}; display: none; font-size:${px(scaleFactor, gradient.subtitleSize)}px; line-height:${px(scaleFactor, gradient.subtitleLineHeight)}px; text-shadow: ${storyShadow};"></textarea>
                ` : ''}
            </div>
        </div>`;
}

window.templatePreviewStory = { renderStoryLayoutControls, renderSlideNavigator, renderCarouselStoryOverlay };
})();
