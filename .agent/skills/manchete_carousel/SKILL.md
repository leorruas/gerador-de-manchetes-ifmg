# Manchete Carousel

Use esta skill para mexer em slides, carrossel, sincronizacao e persistencia por imagem.

## Conceitos

- `state.slides` guarda os dados serializados de todos os slides.
- `state.activeSlideId` aponta para o slide aberto no editor.
- O estado editavel atual fica nos campos diretos de `state`, como `headline`, `transforms`, `slug`, `templateId`.
- `loadSlideToState(id)` salva o slide atual e carrega outro slide para os campos diretos.
- `saveStateToSlides()` copia os campos diretos de volta para `state.slides`.

## Workflow

1. Decida se a mudanca afeta apenas o slide ativo ou todos os slides.
2. Antes de operar em `state.slides`, chame `saveStateToSlides()`.
3. Para trocar de slide, use `loadSlideToState(id)`.
4. Depois de alterar dados, chame `schedulePersist()`.
5. Depois de alterar UI visivel, chame `renderApp()` ou `renderModals()`.

## Sincronizacao

- Para copiar manchetes entre formatos no mesmo slide, use `syncHeadline`.
- Para copiar dados do slide atual para outros slides, use `syncSlides`.
- Preserve a diferenca entre `headline` e `metadata`: usuarios podem querer mesmo texto com imagens diferentes, ou mesma editoria com manchetes diferentes.

## Riscos comuns

- Editar `state.slides` sem salvar primeiro perde alteracoes do slide ativo.
- Persistir sem `saveStateToSlides()` pode gravar dados antigos.
- Mudar template globalmente sem escopo claro quebra carrossel.
