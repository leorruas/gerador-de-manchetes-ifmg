// Renderizacao central: decide entre boas-vindas/editor e posiciona overlays depois do DOM existir.
(() => {
const { constants, state, appElement, modalContainerElement } = window.mancheteApp;
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
            <div class="min-h-screen bg-black text-white pb-28 sm:pb-24">
                <div class="max-w-2xl mx-auto py-6 sm:py-8 px-4">
                    ${EditorPanel()}
                    <div class="mt-8 pt-8">
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
