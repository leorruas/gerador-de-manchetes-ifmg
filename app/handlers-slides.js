// Reordenacao e acoes estruturais de slides do carrossel.
(() => {
const { state, saveStateToSlides, loadSlideToState, schedulePersist } = window.mancheteApp;
const renderApp = () => window.renderApp();

function getSlideIndex(slideId) {
    return state.slides.findIndex(slide => slide.id === slideId);
}

window.handleSlideReorderStart = (event, slideId) => {
    if (!slideId) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', slideId);
};

window.handleSlideReorderOver = (event) => {
    if (!event.target.closest('[data-slide-order-id]')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};

window.handleSlideReorderDrop = (event, targetSlideId) => {
    event.preventDefault();
    const sourceSlideId = event.dataTransfer.getData('text/plain');
    if (!sourceSlideId || sourceSlideId === targetSlideId) return;
    const sourceIndex = getSlideIndex(sourceSlideId);
    const targetIndex = getSlideIndex(targetSlideId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    saveStateToSlides();
    const [movedSlide] = state.slides.splice(sourceIndex, 1);
    state.slides.splice(targetIndex, 0, movedSlide);
    loadSlideToState(state.activeSlideId || movedSlide.id);
    schedulePersist();
    renderApp();
};

})();
