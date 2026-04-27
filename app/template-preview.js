// Card de preview por formato, incluindo overlays de texto e controles de crop/export.
(() => {
const { constants, state, renderRichTextHtml, getPreviewImageMetrics } = window.mancheteApp;
const { TEXT_BOX, TEMPLATE_TEXT, getScale, px } = window.layoutTokens;
const ImagePreview = (format) => {
    const transform = state.transforms[format.id];
    const isCropping = state.croppingFormatId === format.id;
    const imageMetrics = getPreviewImageMetrics(format, transform);
    
    const previewWidth = Math.min(window.innerWidth - 32, 640);
    const scaleFactor = getScale(format, previewWidth);
    const glass = TEMPLATE_TEXT.glass;
    const gradient = TEMPLATE_TEXT.gradient;
    const quote = TEMPLATE_TEXT.quote;
    const infographic = TEMPLATE_TEXT.infographic;
    
    const templateStyles = constants.TEMPLATES[state.templateId];

    const floatButtonsHtml = `
    <div class="absolute left-0 w-full flex justify-center gap-2 z-50 pointer-events-auto" style="top: -40px;">
         <button data-action="toggleEyebrowInput" class="px-3 py-1.5 bg-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold text-black tracking-wider flex items-center gap-1 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/20">
             ${state.showEyebrowInput ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>Editoria' : '<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>Editoria'}
         </button>
         <button data-action="toggleSubtitleInput" class="px-3 py-1.5 bg-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold text-black tracking-wider flex items-center gap-1 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/20">
             ${state.showSubtitleInput ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>Subtítulo' : '<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>Subtítulo'}
         </button>
    </div>`;


    return `
        <div class="bg-zinc-900/50 p-4 sm:p-6 rounded-2xl border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-zinc-700 mb-16 last:mb-0">
            <h3 class="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400/50"></span>
                ${format.name} <span class="opacity-40 font-medium text-[9px] sm:text-[10px]">(${format.width}x${format.height})</span>
            </h3>
            
            <div class="flex gap-2 mb-3 overflow-x-auto hide-scrollbar scroll-smooth">
               ${state.slides && state.slides.length > 1 ? `
               <div class="flex items-center gap-1 bg-zinc-800 p-1 rounded-full border border-zinc-700">
                   ${state.slides.map((s, idx) => `
                       <button data-action="handleSlideSwitch" data-slide-id="${s.id}" class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${state.activeSlideId === s.id ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}">
                           ${idx + 1}
                       </button>
                   `).join('')}
                   <button data-action="addSlide" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 transition-colors focus:outline-none" title="Adicionar Foto">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                   </button>
               </div>
               <div class="flex items-center gap-1 bg-zinc-800 p-1 rounded-full border border-zinc-700">
                   <button data-action="syncSlides" data-scope="headline" class="px-3 h-8 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400" title="Copiar manchetes do slide atual para os outros slides">Manchetes</button>
                   <button data-action="syncSlides" data-scope="metadata" class="px-3 h-8 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400" title="Copiar editoria, subtítulo, template e slug para os outros slides">Metadados</button>
               </div>
               ` : ''}
               
             </div>

            <div id="preview-${format.id}" 
                 class="relative bg-black rounded-[0.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.8)] w-full border border-zinc-800 ${isCropping ? 'cursor-grab' : ''}" 
                 style="aspect-ratio: ${format.width} / ${format.height}"
                 data-drag-type="${isCropping ? 'crop' : ''}" data-format-id="${format.id}">
                
                <img id="preview-image-${format.id}" src="${state.baseImage}" alt="Preview ${format.name}" class="absolute pointer-events-none max-w-none shadow-xl" 
                     style="width:${imageMetrics ? imageMetrics.widthPercent : 100}%; height:${imageMetrics ? imageMetrics.heightPercent : 100}%; left:${imageMetrics ? imageMetrics.leftPercent : 0}%; top:${imageMetrics ? imageMetrics.topPercent : 0}%; border-radius: ${transform.fitMode === 'contain' ? (previewWidth * 0.03) + 'px' : '0'}; object-fit: cover;">

                ${(format.hasText && !state.hideText[format.id]) ? `
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
                    <div id="headline-box-${format.id}" class="absolute" tabindex="0" aria-label="Mover texto ${format.name}" style="width:${TEXT_BOX.widthRatio * 100}%; left:${TEXT_BOX.leftRatio * 100}%;" data-drag-type="text" data-format-id="${format.id}">
                         ${floatButtonsHtml}
                         <div class="rounded-2xl cursor-grab flex items-center relative group transition-all duration-300" 
                              style="padding: ${px(scaleFactor, glass.padding)}px; background-color: ${templateStyles.backgroundColor}; backdrop-filter: ${state.contrastBoost[format.id] ? 'blur(12px) brightness(0.6)' : 'blur(4px)'}; -webkit-backdrop-filter: ${state.contrastBoost[format.id] ? 'blur(12px) brightness(0.6)' : 'blur(4px)'}; ${state.contrastBoost[format.id] ? 'box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);' : ''}">

                            ${format.hasLogo ? `<div style="width:${px(scaleFactor, glass.logoSize)}px; height:${px(scaleFactor, glass.logoSize)}px; margin-right:${px(scaleFactor, glass.logoGap)}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            <div class="flex-grow min-w-0 flex flex-col items-start text-left relative">
                                ${state.showEyebrowInput ? `
                                    <div id="eyebrow-text-${format.id}" class="block w-full text-left uppercase mb-2 cursor-text" data-action="startEyebrowEdit" data-format-id="${format.id}" style="letter-spacing:${glass.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; font-size:${px(scaleFactor, glass.eyebrowSize)}px; line-height:${px(scaleFactor, glass.eyebrowLineHeight)}px;">${state.eyebrows[format.id] || 'EDITAR EDITORIA'}</div>
                                    <textarea id="eyebrow-textarea-${format.id}" data-action="updateEyebrow" data-blur-action="finishEyebrowEdit" data-format-id="${format.id}" 
                                        class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 uppercase mb-2" 
                                        style="letter-spacing:${glass.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; display: none; font-size:${px(scaleFactor, glass.eyebrowSize)}px; line-height:${px(scaleFactor, glass.eyebrowLineHeight)}px;"></textarea>
                                ` : ''}
                                <div id="headline-text-${format.id}" class="block w-full text-left cursor-text" data-action="startHeadlineEdit" data-format-id="${format.id}" style="color: ${templateStyles.textColor}; font-size:${px(scaleFactor, glass.headlineSize)}px; line-height:${px(scaleFactor, glass.headlineLineHeight)}px; text-align: left;">
                                    ${renderRichTextHtml(state.headlines[format.id])}
                                </div>
                                <textarea id="headline-textarea-${format.id}" data-action="updateHeadline" data-blur-action="finishHeadlineEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0" 
                                    style="color: ${templateStyles.textColor}; display: none; font-size:${px(scaleFactor, glass.headlineSize)}px; line-height:${px(scaleFactor, glass.headlineLineHeight)}px; text-align: left;"></textarea>
                                ${state.showSubtitleInput ? `
                                    <div id="subtitle-text-${format.id}" class="block w-full text-left mt-3 cursor-text" data-action="startSubtitleEdit" data-format-id="${format.id}" style="color: ${templateStyles.subtitleColor}; font-size:${px(scaleFactor, glass.subtitleSize)}px; line-height:${px(scaleFactor, glass.subtitleLineHeight)}px;">${renderRichTextHtml(state.subtitles[format.id]) || 'EDITAR SUBTÍTULO'}</div>
                                    <textarea id="subtitle-textarea-${format.id}" data-action="updateSubtitle" data-blur-action="finishSubtitleEdit" data-format-id="${format.id}" 
                                        class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 mt-3" 
                                        style="color: ${templateStyles.subtitleColor}; display: none; font-size:${px(scaleFactor, glass.subtitleSize)}px; line-height:${px(scaleFactor, glass.subtitleLineHeight)}px; text-align: left;"></textarea>
                                ` : ''}
                            </div>
                        </div>
                    </div>` : ''}

                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.GRADIENT ? `
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent pointer-events-none" style="top: calc(${imageMetrics ? imageMetrics.topPercent : 0}% + ${(transform.position.y || 0) * 10}px);"></div>
                    <div id="headline-box-${format.id}" class="absolute" tabindex="0" aria-label="Mover texto ${format.name}" style="width:${TEXT_BOX.widthRatio * 100}%; left:${TEXT_BOX.leftRatio * 100}%;" data-drag-type="text" data-format-id="${format.id}">
                         ${floatButtonsHtml}
                         <div class="cursor-grab flex flex-col items-start relative group" style="padding: ${px(scaleFactor, gradient.padding)}px;">
                            ${format.hasLogo ? `<div style="width:${px(scaleFactor, gradient.logoSize)}px; height:${px(scaleFactor, gradient.logoSize)}px; margin-bottom:${px(scaleFactor, gradient.logoGap)}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            
                            ${state.showEyebrowInput ? `
                                <div id="eyebrow-text-${format.id}" class="block w-full text-left uppercase mb-3 font-bold cursor-text" data-action="startEyebrowEdit" data-format-id="${format.id}" style="letter-spacing:${gradient.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; font-size:${px(scaleFactor, gradient.eyebrowSize)}px; line-height:${px(scaleFactor, gradient.eyebrowLineHeight)}px;">${state.eyebrows[format.id] || 'EDITAR EDITORIA'}</div>
                                <textarea id="eyebrow-textarea-${format.id}" data-action="updateEyebrow" data-blur-action="finishEyebrowEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 uppercase mb-3 font-bold" 
                                    style="letter-spacing:${gradient.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; display: none; font-size:${px(scaleFactor, gradient.eyebrowSize)}px; line-height:${px(scaleFactor, gradient.eyebrowLineHeight)}px;"></textarea>
                            ` : ''}
                            <div id="headline-text-${format.id}" class="block w-full text-left cursor-text" data-action="startHeadlineEdit" data-format-id="${format.id}" style="color: ${templateStyles.textColor}; font-size:${px(scaleFactor, gradient.headlineSize)}px; line-height:${px(scaleFactor, gradient.headlineLineHeight)}px; text-align: left; font-weight: 700; text-shadow: 0px ${px(scaleFactor, gradient.shadowOffsetY)}px ${px(scaleFactor, gradient.shadowBlur)}px rgba(0,0,0,0.5);">
                                ${renderRichTextHtml(state.headlines[format.id])}
                            </div>
                            <textarea id="headline-textarea-${format.id}" data-action="updateHeadline" data-blur-action="finishHeadlineEdit" data-format-id="${format.id}" 
                                class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 font-bold" 
                                style="color: ${templateStyles.textColor}; display: none; font-size:${px(scaleFactor, gradient.headlineSize)}px; line-height:${px(scaleFactor, gradient.headlineLineHeight)}px; text-align: left; text-shadow: 0px ${px(scaleFactor, gradient.shadowOffsetY)}px ${px(scaleFactor, gradient.shadowBlur)}px rgba(0,0,0,0.5);"></textarea>
                            ${state.showSubtitleInput ? `
                                <div id="subtitle-text-${format.id}" class="block w-full text-left mt-4 cursor-text" data-action="startSubtitleEdit" data-format-id="${format.id}" style="color: ${templateStyles.subtitleColor}; font-size:${px(scaleFactor, gradient.subtitleSize)}px; line-height:${px(scaleFactor, gradient.subtitleLineHeight)}px; text-shadow: 0px 2px 8px rgba(0,0,0,0.8);">${renderRichTextHtml(state.subtitles[format.id]) || 'EDITAR SUBTÍTULO'}</div>
                                <textarea id="subtitle-textarea-${format.id}" data-action="updateSubtitle" data-blur-action="finishSubtitleEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent text-left resize-none border-none outline-none focus:ring-0 p-0 mt-4" 
                                    style="color: ${templateStyles.subtitleColor}; display: none; font-size:${px(scaleFactor, gradient.subtitleSize)}px; line-height:${px(scaleFactor, gradient.subtitleLineHeight)}px; text-shadow: 0px 2px 8px rgba(0,0,0,0.8);"></textarea>
                            ` : ''}
                        </div>
                    </div>` : ''}

                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.QUOTE ? `
                    <div class="absolute inset-0 bg-black/60 pointer-events-none"></div>
                    <div id="headline-box-${format.id}" class="absolute" tabindex="0" aria-label="Mover texto ${format.name}" style="width:${TEXT_BOX.widthRatio * 100}%; left:${TEXT_BOX.leftRatio * 100}%;" data-drag-type="text" data-format-id="${format.id}">
                         ${floatButtonsHtml}
                         <div class="cursor-grab flex flex-col items-center justify-center relative group text-center" style="padding: ${px(scaleFactor, quote.padding)}px;">
                            
                            <svg class="text-amber-400 opacity-80" style="width: ${px(scaleFactor, quote.iconSize)}px; height: ${px(scaleFactor, quote.iconSize)}px; margin-bottom: ${px(scaleFactor, quote.iconGap)}px;" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                            <div id="headline-text-${format.id}" class="block w-full cursor-text" data-action="startHeadlineEdit" data-format-id="${format.id}" style="color: ${templateStyles.textColor}; font-size:${px(scaleFactor, quote.headlineSize)}px; line-height:${px(scaleFactor, quote.headlineLineHeight)}px; text-align: center; font-style: italic; font-weight: 700;">
                                ${renderRichTextHtml(state.headlines[format.id])}
                            </div>
                            <textarea id="headline-textarea-${format.id}" data-action="updateHeadline" data-blur-action="finishHeadlineEdit" data-format-id="${format.id}" 
                                class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-center" 
                                style="color: ${templateStyles.textColor}; display: none; font-size:${px(scaleFactor, quote.headlineSize)}px; line-height:${px(scaleFactor, quote.headlineLineHeight)}px; font-style: italic; font-weight: 700;"></textarea>
                            <div style="width:${px(scaleFactor, quote.dividerWidth)}px; height:${px(scaleFactor, quote.dividerHeight)}px; margin-top:${px(scaleFactor, quote.dividerMarginTop)}px; margin-bottom:${px(scaleFactor, quote.dividerMarginBottom)}px;" class="bg-amber-400"></div>
                            ${state.showEyebrowInput ? `
                                <div id="eyebrow-text-${format.id}" class="block w-full font-bold uppercase cursor-text" data-action="startEyebrowEdit" data-format-id="${format.id}" style="letter-spacing:${quote.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; font-size:${px(scaleFactor, quote.eyebrowSize)}px; line-height:${px(scaleFactor, quote.eyebrowLineHeight)}px;">${state.eyebrows[format.id] || 'EDITAR NOME'}</div>
                                <textarea id="eyebrow-textarea-${format.id}" data-action="updateEyebrow" data-blur-action="finishEyebrowEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-center font-bold uppercase" 
                                    style="letter-spacing:${quote.eyebrowTrackingEm}em; color: ${templateStyles.eyebrowColor}; display: none; font-size:${px(scaleFactor, quote.eyebrowSize)}px; line-height:${px(scaleFactor, quote.eyebrowLineHeight)}px;"></textarea>
                            ` : ''}
                            ${state.showSubtitleInput ? `
                                <div id="subtitle-text-${format.id}" class="block w-full cursor-text" data-action="startSubtitleEdit" data-format-id="${format.id}" style="margin-top:${px(scaleFactor, quote.subtitleMarginTop)}px; color: ${templateStyles.subtitleColor}; font-size:${px(scaleFactor, quote.subtitleSize)}px; line-height:${px(scaleFactor, quote.subtitleLineHeight)}px;">${renderRichTextHtml(state.subtitles[format.id]) || 'EDITAR CARGO/FONTE'}</div>
                                <textarea id="subtitle-textarea-${format.id}" data-action="updateSubtitle" data-blur-action="finishSubtitleEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-center" 
                                    style="margin-top:${px(scaleFactor, quote.subtitleMarginTop)}px; color: ${templateStyles.subtitleColor}; display: none; font-size:${px(scaleFactor, quote.subtitleSize)}px; line-height:${px(scaleFactor, quote.subtitleLineHeight)}px;"></textarea>
                            ` : ''}
                        </div>
                    </div>` : ''}
                    
                    ${templateStyles.layoutType === constants.LAYOUT_TYPE.INFOGRAPHIC ? `
                    <div class="absolute inset-0 bg-black/40 pointer-events-none"></div>
                    <div id="headline-box-${format.id}" class="absolute" tabindex="0" aria-label="Mover texto ${format.name}" style="width:${TEXT_BOX.widthRatio * 100}%; left:${TEXT_BOX.leftRatio * 100}%;" data-drag-type="text" data-format-id="${format.id}">
                         ${floatButtonsHtml}
                         <div class="cursor-grab flex flex-col items-center justify-center relative group text-center" style="padding: ${px(scaleFactor, infographic.padding)}px;">
                            ${format.hasLogo ? `<div style="width:${px(scaleFactor, infographic.logoSize)}px; height:${px(scaleFactor, infographic.logoSize)}px; margin-bottom:${px(scaleFactor, infographic.logoGap)}px" class="flex-shrink-0">${constants.IFMG_LOGO_SVG_STRING}</div>` : ''}
                            ${state.showEyebrowInput ? `
                                <div id="eyebrow-text-${format.id}" class="block w-full font-bold tracking-tight cursor-text" data-action="startEyebrowEdit" data-format-id="${format.id}" style="margin-bottom:${px(scaleFactor, infographic.eyebrowMarginBottom)}px; color: ${templateStyles.eyebrowColor}; font-size:${px(scaleFactor, infographic.eyebrowSize)}px; line-height:${px(scaleFactor, infographic.eyebrowLineHeight)}px; text-shadow: 0px ${px(scaleFactor, infographic.shadowOffsetY)}px ${px(scaleFactor, infographic.shadowBlur)}px rgba(0,0,0,0.5);">${state.eyebrows[format.id] || 'EDITAR NÚMERO/DATA'}</div>
                                <textarea id="eyebrow-textarea-${format.id}" data-action="updateEyebrow" data-blur-action="finishEyebrowEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-center font-bold" 
                                    style="margin-bottom:${px(scaleFactor, infographic.eyebrowMarginBottom)}px; color: ${templateStyles.eyebrowColor}; display: none; font-size:${px(scaleFactor, infographic.eyebrowSize)}px; line-height:${px(scaleFactor, infographic.eyebrowLineHeight)}px;"></textarea>
                            ` : ''}
                            <div id="headline-text-${format.id}" class="block w-full font-bold uppercase tracking-wider cursor-text" data-action="startHeadlineEdit" data-format-id="${format.id}" style="color: ${templateStyles.textColor}; font-size:${px(scaleFactor, infographic.headlineSize)}px; line-height:${px(scaleFactor, infographic.headlineLineHeight)}px; text-align: center;">
                                ${renderRichTextHtml(state.headlines[format.id])}
                            </div>
                            <textarea id="headline-textarea-${format.id}" data-action="updateHeadline" data-blur-action="finishHeadlineEdit" data-format-id="${format.id}" 
                                class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-bold uppercase tracking-wider text-center" 
                                style="color: ${templateStyles.textColor}; display: none; font-size:${px(scaleFactor, infographic.headlineSize)}px; line-height:${px(scaleFactor, infographic.headlineLineHeight)}px;"></textarea>
                            ${state.showSubtitleInput ? `
                                <div id="subtitle-text-${format.id}" class="block w-full cursor-text" data-action="startSubtitleEdit" data-format-id="${format.id}" style="margin-top:${px(scaleFactor, infographic.subtitleMarginTop)}px; color: ${templateStyles.subtitleColor}; font-size:${px(scaleFactor, infographic.subtitleSize)}px; line-height:${px(scaleFactor, infographic.subtitleLineHeight)}px; background-color: rgba(0,0,0,0.5); padding: ${px(scaleFactor, infographic.subtitlePaddingY)}px ${px(scaleFactor, infographic.subtitlePaddingX)}px; border-radius: ${px(scaleFactor, infographic.subtitleRadius)}px; display: inline-block;">${renderRichTextHtml(state.subtitles[format.id]) || 'EDITAR APOIO'}</div>
                                <textarea id="subtitle-textarea-${format.id}" data-action="updateSubtitle" data-blur-action="finishSubtitleEdit" data-format-id="${format.id}" 
                                    class="block w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-center" 
                                    style="margin-top:${px(scaleFactor, infographic.subtitleMarginTop)}px; color: ${templateStyles.subtitleColor}; display: none; font-size:${px(scaleFactor, infographic.subtitleSize)}px; line-height:${px(scaleFactor, infographic.subtitleLineHeight)}px; background-color: rgba(0,0,0,0.5); padding: ${px(scaleFactor, infographic.subtitlePaddingY)}px ${px(scaleFactor, infographic.subtitlePaddingX)}px; border-radius: ${px(scaleFactor, infographic.subtitleRadius)}px;"></textarea>
                            ` : ''}
                        </div>
                    </div>` : ''}
                ` : ''}
                
                ${!isCropping ? `
                  <div class="absolute top-2 right-2 flex gap-2 z-20">
                      ${format.hasText ? `
                      <button aria-label="${state.hideText[format.id] ? 'Exibir Textos' : 'Imagem Pura'}" data-action="toggleHideText" data-format-id="${format.id}" class="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${state.hideText[format.id] ? 'text-amber-400' : 'text-white'}">
                         ${state.hideText[format.id] ? `
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                         ` : `
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                         `}
                      </button>
                      ${templateStyles.layoutType === constants.LAYOUT_TYPE.GLASS_BOX ? `
                      <button aria-label="${state.contrastBoost[format.id] ? 'Desativar contraste' : 'Ativar contraste'}" data-action="toggleContrastBoost" data-format-id="${format.id}" class="px-3 py-2 text-[9px] font-bold tracking-wider bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${state.contrastBoost[format.id] ? 'text-amber-400' : 'text-white'}">
                          Contraste
                      </button>
                      ` : ''}
                      ` : ''}
                      <button aria-label="Alterar Preenchimento" data-action="toggleFitMode" data-format-id="${format.id}" class="px-4 py-2 text-[9px] font-bold tracking-wider bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 text-white">
                          ${transform.fitMode === 'contain' ? 'Preencher' : 'Ajustar'}
                      </button>
                      <button aria-label="Exportar ${format.name}" data-action="${state.slides && state.slides.length > 1 ? 'openBatchExportModal' : 'openExportModal'}" data-format-id="${format.id}" class="px-4 py-2 text-[9px] font-bold tracking-wider bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 text-white">
                           ${state.slides && state.slides.length > 1 ? 'Exportar Tudo' : 'Exportar'}
                      </button>
                      <button aria-label="Reenquadrar ${format.name}" data-action="toggleCropMode" data-format-id="${format.id}" class="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 text-white">
                          ${constants.CropIcon}
                      </button>
                  </div>
                  ` : ''}

                 ${isCropping ? `
                    <div class="absolute inset-0 bg-black/40 pointer-events-none"></div>
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-md bg-black/60 backdrop-blur-sm rounded-3xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10" data-stop-propagation="true">
                        <div class="flex items-center gap-2 flex-grow min-w-0">
                            <button aria-label="Diminuir zoom" data-action="adjustZoom" data-delta="-0.1" class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400">-</button>
                            <input type="range" id="zoom-slider-${format.id}" min="1" max="3" step="0.01" value="${transform.zoom}" data-action="handleZoomChange" data-stop-propagation="true"
                                   class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer">
                            <button aria-label="Aumentar zoom" data-action="adjustZoom" data-delta="0.1" class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400">+</button>
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto">
                            <button aria-label="Cancelar reenquadramento ${format.name}" data-action="cancelCropInline" data-format-id="${format.id}" class="flex-1 bg-zinc-700 text-white font-semibold py-2 px-3 rounded-full text-sm hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400">Cancelar</button>
                            <button aria-label="Salvar reenquadramento ${format.name}" data-action="saveCropInline" data-format-id="${format.id}" class="flex-1 bg-amber-400 text-black font-bold py-2 px-3 rounded-full text-sm hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">Salvar</button>
                        </div>
                    </div>
                 ` : ''}
            </div>
        </div>
    `;
};
window.mancheteTemplates = { ...(window.mancheteTemplates || {}), ImagePreview };
})();
