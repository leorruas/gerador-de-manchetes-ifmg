// Handlers expostos no window para a delegacao central de eventos.
// Drag vertical do texto e pan da imagem em modo crop.
(() => {
const { constants, canvasExport, DEFAULT_TEMPLATE_ID, state, createDefaultPositions, createDefaultTransforms, showFeedback, loadSlideToState, saveStateToSlides, schedulePersist, clamp, applyTemplate, updateCropPreview, getPreviewImageMetrics } = window.mancheteApp;
const { getSafeMargins } = window.layoutTokens;
const renderApp = () => window.renderApp();
const renderModals = () => window.renderModals();
// --- Drag Handlers for Text Box and Crop Image ---
let dragContext = {};

window.startDrag = (event, type, formatId) => {
    // We removed event.preventDefault() here to allow clicks on mobile (BUG-021)
    // touch-action: none on the elements handles scroll prevention.
    dragContext = { type, formatId, startX: event.clientX || event.touches[0].clientX, startY: event.clientY || event.touches[0].clientY };
    if (type === 'text') {
        const element = document.getElementById(`headline-box-${formatId}`);
        dragContext.initialTop = element.offsetTop;
        document.body.style.cursor = 'grabbing';
    } else if (type === 'crop') {
        dragContext.initialPosition = { ...state.transforms[formatId].position };
        document.getElementById(`preview-${formatId}`).style.cursor = 'grabbing';
    }
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', endDrag);
};

function onDrag(event) {
    if (!dragContext.type) return;
    const currentX = event.clientX || event.touches[0].clientX;
    const currentY = event.clientY || event.touches[0].clientY;
    const deltaX = currentX - dragContext.startX;
    const deltaY = currentY - dragContext.startY;

    if (dragContext.type === 'text') {
        const preview = document.getElementById(`preview-${dragContext.formatId}`);
        const box = document.getElementById(`headline-box-${dragContext.formatId}`);
        if (!preview || !box) return;
        
        // Add Safe Area restrictions (margin)
        const safeMargins = getSafeMargins(preview.offsetHeight, state.templateId);
        const absoluteMinTop = safeMargins.top;
        const absoluteMaxTop = preview.offsetHeight - box.offsetHeight - safeMargins.bottom;
        
        // Ensure box fits. If it doesn't fit with margins, relax restraints
        const usableMinTop = Math.min(absoluteMinTop, absoluteMaxTop < absoluteMinTop ? 0 : absoluteMinTop);
        const usableMaxTop = Math.max(absoluteMaxTop, absoluteMaxTop < absoluteMinTop ? preview.offsetHeight - box.offsetHeight : absoluteMaxTop);

        let newTop = dragContext.initialTop + deltaY;
        newTop = Math.max(usableMinTop, Math.min(newTop, usableMaxTop));
        box.style.top = `${newTop}px`;
        
        // Calculate percentage within the FULL safe area range (not the absolute range)
        const range = usableMaxTop - usableMinTop;
        const newPercentage = range > 0 ? (newTop - usableMinTop) / range : 0.5;
        state.textVerticalPositions[dragContext.formatId] = newPercentage;

    } else if (dragContext.type === 'crop') {
        const newPos = {
            x: dragContext.initialPosition.x,
            y: dragContext.initialPosition.y
        };
        const preview = document.getElementById(`preview-${dragContext.formatId}`);
        const format = constants.FORMATS[dragContext.formatId];
        const metrics = preview && format ? getPreviewImageMetrics(format) : null;

        if (preview && metrics) {
            let limitX = metrics.widthPercent > 100 ? preview.clientWidth * (metrics.overflowXPercent / 100) : preview.clientWidth * (metrics.underflowXPercent / 100);
            let limitY = metrics.heightPercent > 100 ? preview.clientHeight * (metrics.overflowYPercent / 100) : preview.clientHeight * (metrics.underflowYPercent / 100);
            
            const signX = metrics.widthPercent > 100 ? -1 : 1;
            const signY = metrics.heightPercent > 100 ? -1 : 1;
            
            newPos.x = limitX > 0 ? clamp(dragContext.initialPosition.x + (signX * (deltaX * 2) / limitX), -1, 1) : 0;
            newPos.y = limitY > 0 ? clamp(dragContext.initialPosition.y + (signY * (deltaY * 2) / limitY), -1, 1) : 0;
        }
        state.transforms[dragContext.formatId].position = newPos;
        updateCropPreview(dragContext.formatId);
    }
}

function endDrag() {
    if (dragContext.type === 'text') {
        document.body.style.cursor = 'default';
    } else if (dragContext.type === 'crop' && dragContext.formatId) {
        const container = document.getElementById(`preview-${dragContext.formatId}`);
        if(container) container.style.cursor = 'default';
    }
    schedulePersist();
    dragContext = {};
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', endDrag);
}

function applyTextPosition(formatId, nextPosition) {
    state.textVerticalPositions[formatId] = clamp(nextPosition, 0, 1);
    const preview = document.getElementById(`preview-${formatId}`);
    const box = document.getElementById(`headline-box-${formatId}`);
    if (!preview || !box) return;

    const safeMargins = getSafeMargins(preview.offsetHeight, state.templateId);
    const minTop = safeMargins.top;
    const maxTop = preview.offsetHeight - box.offsetHeight - safeMargins.bottom;
    const usableMinTop = Math.min(minTop, maxTop < minTop ? 0 : minTop);
    const usableMaxTop = Math.max(maxTop, maxTop < minTop ? preview.offsetHeight - box.offsetHeight : maxTop);
    const top = usableMinTop + (usableMaxTop - usableMinTop) * state.textVerticalPositions[formatId];
    box.style.top = `${top}px`;
}

window.handleTextPositionKeydown = (event, formatId) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    if (event.target.matches('textarea, input')) return;

    event.preventDefault();
    const step = event.shiftKey ? 0.08 : 0.03;
    const current = state.textVerticalPositions[formatId] ?? 0.5;
    const next = {
        ArrowUp: current - step,
        ArrowDown: current + step,
        Home: 0,
        End: 1,
    }[event.key];

    applyTextPosition(formatId, next);
    schedulePersist();
};

// --- CONTRAST ANALYSIS FUNCTION ---
// NOTE: analyzeContrast was removed (BUG-018) because it referenced state.cropData
// which no longer exists. The contrastBoost flag in state is still respected by the
// canvas export engine — it just can't be auto-detected anymore.
})();
