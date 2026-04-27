// Renderizacao central: decide entre boas-vindas/editor e posiciona overlays depois do DOM existir.
(() => {
const { constants, state, appElement, modalContainerElement } = window.mancheteApp;
const { getSafeMargins } = window.layoutTokens;
const { WelcomeScreen, ImagePreview, ControlsBar, EditorPanel, ExportModal, BatchExportModal, HistoryModal, FeedbackBanner } = window.mancheteTemplates;
function renderApp() {
    if (!appElement) return;

    if (!state.baseImage) {
        appElement.innerHTML = `
            ${FeedbackBanner()}
            ${WelcomeScreen()}
        `;
    } else {
        const activeFormats = state.slides && state.slides.length > 1 
            ? [constants.FORMATS[constants.FormatId.INSTA_POST], constants.FORMATS[constants.FormatId.INSTA_STORY]]
            : Object.values(constants.FORMATS);

        const previewsHTML = activeFormats.map(ImagePreview).join('');
        
        appElement.innerHTML = `
            ${FeedbackBanner()}
            <div class="min-h-screen bg-black text-white" style="padding-bottom: calc(7.5rem + env(safe-area-inset-bottom));">
                <div class="max-w-2xl mx-auto py-6 sm:py-8 px-4">
                    ${EditorPanel()}
                    <div class="mt-12 pt-4 flex flex-col gap-16">
                        ${previewsHTML}
                    </div>
                </div>
                ${ControlsBar()}
            </div>
        `;
        // Because height is now known, we position text box overlays dynamically.
        requestAnimationFrame(() => {

            activeFormats.forEach(format => {
                if (format.hasText) {
                    const preview = document.getElementById(`preview-${format.id}`);
                    const box = document.getElementById(`headline-box-${format.id}`);
                    if (preview && box) {
                        const safeMargins = getSafeMargins(preview.offsetHeight, state.templateId);
                        const absoluteMinTop = safeMargins.top;
                        const absoluteMaxTop = preview.offsetHeight - box.offsetHeight - safeMargins.bottom;
                        
                        const usableMinTop = Math.min(absoluteMinTop, absoluteMaxTop < absoluteMinTop ? 0 : absoluteMinTop);
                        const usableMaxTop = Math.max(absoluteMaxTop, absoluteMaxTop < absoluteMinTop ? preview.offsetHeight - box.offsetHeight : absoluteMaxTop);

                        const range = usableMaxTop - usableMinTop;
                        const topPosition = range > 0 ? usableMinTop + (state.textVerticalPositions[format.id] * range) : usableMinTop;
                        const clampedTop = Math.max(0, Math.min(topPosition, preview.offsetHeight - box.offsetHeight - 8));
                        box.style.top = `${clampedTop}px`;
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
    } else if (state.showBatchExportModal) {
        modalContainerElement.innerHTML = BatchExportModal();
    } else if (state.showHistoryModal) {
        modalContainerElement.innerHTML = HistoryModal();
    } else {
        modalContainerElement.innerHTML = '';
    }
}
window.renderApp = renderApp;
window.renderModals = renderModals;
})();
