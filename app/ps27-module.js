// Módulo Processo Seletivo 2027: compõe as camadas originais exportadas do Figma.
(() => {
const { state } = window.mancheteApp;
const persistPs27 = () => window.mancheteApp.schedulePersist?.();
const asset = (name, extension = 'png') => window.ps27EmbeddedAssets?.[`${name}.${extension}`] || `./assets/ps27/${name}.${extension}`;
const formats = {
  post: { name: 'Instagram Post', width: 1080, height: 1350 },
  story: { name: 'Instagram Story', width: 1080, height: 1920 },
  campi: { name: 'Portal dos Campi', width: 400, height: 400 },
  portal: { name: 'Portal Principal', width: 743, height: 423 },
};
const formatIds = Object.keys(formats);
const getPs27Value = (collection, formatId, legacyKey) => state.ps27[collection]?.[formatId] ?? state.ps27[legacyKey];
const getEyebrow = (formatId) => getPs27Value('eyebrows', formatId, 'eyebrow');
const getSubtitle = (formatId) => getPs27Value('subtitles', formatId, 'subtitle');
const showsEyebrow = (formatId) => getPs27Value('showEyebrows', formatId, 'showEyebrow');
const showsSubtitle = (formatId) => getPs27Value('showSubtitles', formatId, 'showSubtitle');
// Posições aprovadas no navegador: esquerda, topo e largura relativas ao formato.
// A mesma fonte é usada tanto na prévia editável quanto no canvas de exportação.
const textBoxes = {
  post: { left: 0.0796296296, top: 0.75, width: 0.70, height: 0.19 },
  story: { left: 0.0796296296, top: 0.70, width: 0.65, height: 0.18 },
  campi: { left: 0.08, top: 0.725, width: 0.65, height: 0.25 },
  portal: { left: 0.38, top: 0.75, width: 0.57, height: 0.28, fontMin: 10, fontMax: 20 },
};
const postLayers = {
  fundo: [-1675, -288, 3349, 2233], historias: [-420, 142, 1920, 675], logo: [21, 27, 277, 276],
  lucas: [198, -38, 1080, 1265], paulo: [358, -58, 882, 1058], lavinia: [198, -33, 1080, 1227],
  'adesivo-retangular-amarelo': [-543, 566, 2197, 1799], 'adesivo-retangular-vermelho': [-543, 566, 2197, 1799], 'adesivo-retangular-verde': [-620, 580, 2197, 1799],
  'slogan-ps27': [21, 702, 604, 321], 'slogan-ps27-pink': [21, 702, 604, 321], estrela: [799, 862, 321, 328],
  'adesivo-data-amarelo': [727.024, 846.561, 361.315, 367.472], 'adesivo-data-azul': [712, 834, 391.363, 392.594], 'adesivo-data-vermelho': [712, 834, 391.363, 392.594],
};
const storyLayers = {
  fundo: [-1675, -18, 3349, 2233], historias: [-420, 412, 1920, 675], logo: [21, 297, 277, 276],
  lucas: [20, 23, 1258, 1474], paulo: [206, 0, 1028, 1233], lavinia: [20, 29, 1258, 1429],
  'adesivo-retangular-amarelo': [-543, 836, 2197, 1799], 'adesivo-retangular-vermelho': [-543, 836, 2197, 1799], 'adesivo-retangular-verde': [-620, 850, 2197, 1799],
  'slogan-ps27': [21, 972, 604, 321], 'slogan-ps27-pink': [21, 972, 604, 321], estrela: [799, 1132, 321, 328],
  'adesivo-data-amarelo': [735.024, 1079.56, 361.315, 367.472], 'adesivo-data-azul': [720, 1067, 391.363, 392.594], 'adesivo-data-vermelho': [720, 1067, 391.363, 392.594],
};
const campiLayers = { fundo: [-338, -45, 836.264, 557.577], historias: [-24.62, 62.37, 479.435, 168.551], logo: [4, 18.5, 138.5, 138], lucas: [129.7, 17.43, 269.68, 315.88], paulo: [169.65, 12.43, 220.28, 264.14], lavinia: [129.7, 18.67, 269.68, 306.39], 'adesivo-retangular-amarelo': [-55.33, 168.25, 548.6, 449.22], 'adesivo-retangular-vermelho': [-55.33, 168.25, 548.6, 449.22], 'adesivo-retangular-verde': [-74.56, 171.74, 548.6, 449.22], 'slogan-ps27': [-2.5, 199, 169.266, 89.904], 'slogan-ps27-pink': [-2.5, 199, 169.266, 89.904], estrela: [279.77, 242.16, 80.14, 81.92], 'adesivo-data-amarelo': [256.283, 190.417, 127.051, 129.216], 'adesivo-data-azul': [251, 186, 137.617, 138.05], 'adesivo-data-vermelho': [251, 186, 137.617, 138.05] };
const portalLayers = { fundo: [-223, -25, 1024, 682.75], historias: [-72, 24.66, 819.8, 288.21], logo: [25, 26.5, 138.5, 138], lucas: [357, -19.65, 390.92, 457.88], paulo: [414.91, -26.89, 319.31, 382.88], lavinia: [357, -17.84, 390.92, 444.13], 'adesivo-retangular-amarelo': [-121.89, 128.77, 1120.61, 917.61], 'adesivo-retangular-vermelho': [-121.89, 128.77, 1120.61, 917.61], 'adesivo-retangular-verde': [-161.43, 134.26, 1120.61, 917.61], 'slogan-ps27': [104, 236.5, 204.2785, 108.5], 'slogan-ps27-pink': [104, 236.5, 204.2785, 108.5], estrela: [636, 247, 98.14, 100.31], 'adesivo-data-amarelo': [615.283, 222.417, 127.051, 129.216], 'adesivo-data-azul': [610, 218, 137.617, 138.05], 'adesivo-data-vermelho': [610, 218, 137.617, 138.05], rotation: 2.39985 };
const images = new Map();
let assetsReady = false;
const assetList = [
  ['fundo', 'jpg'], ['fundo-historias'], ['lucas'], ['paulo'], ['lavinia'], ['logo-ifmg-adesivo'],
  ['adesivo-retangular-amarelo'], ['adesivo-retangular-vermelho'], ['adesivo-retangular-verde'],
  ['slogan-ps27'], ['slogan-ps27-pink'], ['estrela'], ['adesivo-data-amarelo'], ['adesivo-data-azul'], ['adesivo-data-vermelho'],
];
function image(name, extension = 'png') {
  const key = `${name}.${extension}`;
  if (!images.has(key)) { const value = new Image(); value.src = asset(name, extension); images.set(key, value); }
  return images.get(key);
}
function drawImage(ctx, source, rect) { if (source.complete && source.naturalWidth) ctx.drawImage(source, ...rect); }
function drawRotatedImage(ctx, source, rect, degrees) { if (!degrees) return drawImage(ctx, source, rect); ctx.save(); ctx.translate(rect[0], rect[1]); ctx.rotate(degrees * Math.PI / 180); ctx.drawImage(source, 0, 0, rect[2], rect[3]); ctx.restore(); }
function splitLongWord(ctx, word, maxWidth) {
  const pieces = []; let piece = '';
  for (const character of word) { if (piece && ctx.measureText(piece + character).width > maxWidth) { pieces.push(piece); piece = character; } else piece += character; }
  if (piece) pieces.push(piece); return pieces;
}
function wrapHeadline(ctx, text, maxWidth) {
  const lines = [];
  text.trim().split(/\r?\n/).forEach((paragraph) => {
    let line = '';
    paragraph.trim().split(/\s+/).filter(Boolean).forEach((word) => {
      const tokens = ctx.measureText(word).width > maxWidth ? splitLongWord(ctx, word, maxWidth) : [word];
      tokens.forEach((token) => { const candidate = line ? `${line} ${token}` : token; if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = token; } else line = candidate; });
    });
    if (line) lines.push(line);
  });
  return lines;
}
function getHeadline(formatId) { return state.ps27.headlines?.[formatId] ?? state.ps27.headline; }
function drawHeadline(ctx, formatId) {
  const format = formats[formatId]; const box = textBoxes[formatId];
  const x = format.width * box.left; const y = format.height * box.top; const width = format.width * box.width; const height = format.height * box.height;
  const text = getHeadline(formatId).trim();
  const scale = format.width / 1080; const padding = 16 * scale; const headlineSize = (formatId === 'portal' ? 36 : formatId === 'story' ? 54 : 48) * scale;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
  const eyebrowOffset = showsEyebrow(formatId) ? (formatId === 'story' ? 26 : 22) * scale : 0;
  ctx.fillStyle = '#FFFFFF'; ctx.font = `700 ${headlineSize}px Archivo, Arial, sans-serif`; ctx.textBaseline = 'top';
  const headlineLines = window.richTextService.parseRichTextToLines(ctx, text, `700 ${headlineSize}px Archivo, Arial, sans-serif`, width - padding * 2);
  window.richTextService.drawRichTextLines(ctx, headlineLines, x + padding, y + padding + eyebrowOffset, headlineSize, width - padding * 2, '#FFFFFF');
  const subtitleSize = (formatId === 'portal' ? 18 : formatId === 'campi' ? 22 : formatId === 'story' ? 30 : 26) * scale;
  if (showsSubtitle(formatId) && getSubtitle(formatId)) { ctx.font = `400 ${subtitleSize}px Archivo, Arial, sans-serif`; const subtitleLines = window.richTextService.parseRichTextToLines(ctx, getSubtitle(formatId), ctx.font, width - padding * 2); window.richTextService.drawRichTextLines(ctx, subtitleLines, x + padding, y + padding + eyebrowOffset + headlineLines.length * headlineSize + headlineSize * .35, subtitleSize * 1.15, width - padding * 2, '#FFFFFF'); }
  if (showsEyebrow(formatId) && getEyebrow(formatId)) { ctx.font = `700 ${(formatId === 'story' ? 30 : 26) * scale}px Archivo, Arial, sans-serif`; ctx.fillStyle = '#FBBF24'; ctx.fillText(getEyebrow(formatId).toUpperCase(), x + padding, y + 5 * scale); }
  ctx.restore();
}
function drawDateTime(ctx, formatId, layers) {
  const ps27 = state.ps27;
  if (!ps27.showDateTime) return;
  const rect = layers[ps27.dateSticker];
  if (!rect) return;
  drawImage(ctx, image(ps27.dateSticker), rect);
  const [x, y, width, height] = rect;
  const date = `${ps27.dateDay || 'DD'}/${ps27.dateMonth || 'MM'}`;
  const hour = ps27.dateHour ? `${ps27.dateHour}h` : 'HHh';
  ctx.save(); ctx.fillStyle = '#111111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.max(14, Math.round(width * .17))}px Archivo, Arial, sans-serif`;
  ctx.fillText(date, x + width * .5, y + height * .45);
  ctx.font = `900 ${Math.max(12, Math.round(width * .135))}px Archivo, Arial, sans-serif`;
  ctx.fillText(hour, x + width * .5, y + height * .58);
  ctx.restore();
}
function renderSocial(ctx, key, includeHeadline = true) {
  const layers = ({ post: postLayers, story: storyLayers, campi: campiLayers, portal: portalLayers })[key];
  const ps27 = state.ps27;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, formats[key].width, formats[key].height);
  drawImage(ctx, image('fundo', 'jpg'), layers.fundo);
  drawImage(ctx, image('fundo-historias'), layers.historias);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(0, 0, formats[key].width, formats[key].height);
  drawImage(ctx, image(ps27.character), layers[ps27.character]);
  drawRotatedImage(ctx, image(ps27.sticker), layers[ps27.sticker], layers.rotation);
  drawImage(ctx, image('logo-ifmg-adesivo'), layers.logo);
  drawImage(ctx, image(ps27.slogan), layers[ps27.slogan]);
  if (!ps27.showDateTime) drawImage(ctx, image('estrela'), layers.estrela);
  drawDateTime(ctx, key, layers);
  if (includeHeadline) drawHeadline(ctx, key);
}
function renderCanvas(formatId) {
  const canvas = document.getElementById(`ps27-canvas-${formatId}`); if (!canvas) return;
  const format = formats[formatId]; const density = Math.max(2, window.devicePixelRatio || 1);
  canvas.width = format.width * density; canvas.height = format.height * density;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(density, 0, 0, density, 0, 0);
  renderSocial(ctx, formatId);
  if (![...images.values()].every((item) => item.complete)) window.setTimeout(() => renderCanvas(formatId), 80);
}
function waitForImage(source) {
  if (source.complete && source.naturalWidth) return Promise.resolve();
  return new Promise((resolve, reject) => { source.addEventListener('load', resolve, { once: true }); source.addEventListener('error', reject, { once: true }); });
}
function ensureAssets() { return Promise.all(assetList.map(([name, extension]) => waitForImage(image(name, extension)))).then(() => { assetsReady = true; }); }
function ps27Filename(format, type) { return `processo-seletivo-2027-${format.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${type}`; }
function downloadPs27Canvas(canvas, format, type) {
  const canvasType = type === 'jpg' ? 'jpeg' : type;
  const link = document.createElement('a');
  link.download = ps27Filename(format, type);
  const quality = format.name.startsWith('Portal') ? .92 : .78;
  link.href = canvas.toDataURL(`image/${canvasType}`, canvasType === 'jpeg' ? quality : 1);
  link.style.display = 'none'; document.body.appendChild(link); link.click();
  window.setTimeout(() => link.remove(), 1000);
}
const choices = (action, current, options) => options.map(([value, label]) => `<button data-action="${action}" data-value="${value}" class="px-3 py-2 rounded-full text-xs font-bold border transition-colors ${current === value ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'}">${label}</button>`).join('');
function PreviewCard(formatId) {
  const format = formats[formatId];
  const box = textBoxes[formatId];
  const left = box.left * 100; const top = box.top * 100; const width = box.width * 100; const height = box.height * 100; const fontSize = formatId === 'portal' ? '3.333cqw' : formatId === 'story' ? '5cqw' : '4.444cqw'; const eyebrowFontSize = formatId === 'story' ? '.556em' : '.542em'; const subtitleFontSize = formatId === 'portal' ? '.5em' : formatId === 'campi' ? '.458em' : formatId === 'story' ? '.556em' : '.542em';
  const buttonClass = 'px-3 py-1.5 bg-amber-400 border border-amber-500/20 rounded-full font-bold text-black tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/20';
  const buttons = `<div class="absolute left-0 w-full flex justify-center gap-2 z-30 pointer-events-auto" style="top:-40px;"><button data-action="ps27ToggleEyebrow" data-format="${formatId}" class="${buttonClass}" style="font-size:60%;">${showsEyebrow(formatId) ? '−' : '+'} Editoria</button><button data-action="ps27ToggleSubtitle" data-format="${formatId}" class="${buttonClass}" style="font-size:60%;">${showsSubtitle(formatId) ? '−' : '+'} Subtítulo</button></div>`;
  state.ps27.showEyebrow = showsEyebrow(formatId); state.ps27.showSubtitle = showsSubtitle(formatId);
  state.ps27.eyebrow = getEyebrow(formatId); state.ps27.subtitle = getSubtitle(formatId);
  return `<style>.ps27-text-editor:not(:focus),.ps27-eyebrow-editor:not(:focus){color:transparent!important;text-shadow:none}.ps27-text-editor:focus{color:#fff!important}.ps27-eyebrow-editor:focus{color:#fbbf24!important}</style><div class="bg-zinc-900/50 p-4 sm:p-6 rounded-2xl border border-zinc-800 shadow-2xl"><div class="flex items-center justify-between gap-4 mb-4 px-1"><h3 class="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-400/50"></span>${format.name}<span class="opacity-40 font-medium">(${format.width}x${format.height})</span></h3></div><div class="relative bg-black rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.8)] border border-zinc-800" style="container-type:inline-size;"><canvas id="ps27-canvas-${formatId}" class="block w-full h-auto"></canvas><div id="headline-box-${formatId}" class="absolute text-white outline-none" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;font-size:${fontSize};line-height:1;padding:1.481cqw;overflow:visible;">${buttons}<div class="h-full overflow-hidden">${state.ps27.showEyebrow ? `<div contenteditable="true" data-action="ps27SetEyebrow" data-placeholder="Editoria" class="ps27-eyebrow-editor cursor-text font-bold tracking-[.1em] text-amber-400 outline-none" style="font-size:${eyebrowFontSize};line-height:1;margin-bottom:.35em;" spellcheck="true">${state.ps27.eyebrow}</div>` : ''}<div contenteditable="true" role="textbox" aria-label="Editar texto da arte" data-action="ps27SetHeadline" data-blur-action="ps27RenderRichText" data-rich-text="headline" data-placeholder="Digite o seu texto aqui" data-format="${formatId}" class="ps27-text-editor font-bold outline-none cursor-text" style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;" spellcheck="true">${getHeadline(formatId)}</div>${state.ps27.showSubtitle ? `<div contenteditable="true" data-action="ps27SetSubtitle" data-blur-action="ps27RenderRichText" data-rich-text="subtitle" data-placeholder="Seu subtítulo aqui" class="ps27-text-editor block max-w-full cursor-text font-normal outline-none" style="font-size:${subtitleFontSize};line-height:1.15;margin-top:.35em;white-space:pre-wrap;" spellcheck="true">${state.ps27.subtitle}</div>` : ''}</div></div></div></div>`;
}
function Ps27Screen() {
  const ps27 = state.ps27;
  return `<div class="min-h-screen bg-black text-white pb-40 sm:pb-48"><div class="max-w-2xl mx-auto px-4 py-6 sm:py-8">
    <div class="flex items-center justify-between gap-4 mb-7"><div><p class="text-xs font-bold tracking-[.18em] uppercase text-amber-400">Manchete Express · Novo módulo</p><h1 class="text-3xl sm:text-4xl font-bold mt-2">Processo Seletivo 2027</h1></div><button data-action="closePs27" class="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-bold hover:bg-zinc-700">Voltar</button></div>
    <section class="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6"><div class="grid grid-cols-1 sm:grid-cols-2" style="column-gap:2.5rem;row-gap:2.5rem;">
      <section><h2 class="text-sm font-bold mb-3">Slogan · 2 opções</h2><div class="flex flex-wrap gap-2">${choices('ps27SetSlogan', ps27.slogan, [['slogan-ps27', 'Verde'], ['slogan-ps27-pink', 'Pink']])}</div></section>
      <section><h2 class="text-sm font-bold mb-3">BG para texto · 3 opções</h2><div class="flex flex-wrap gap-2">${choices('ps27SetSticker', ps27.sticker, [['adesivo-retangular-amarelo', 'Verde'], ['adesivo-retangular-vermelho', 'Vermelho'], ['adesivo-retangular-verde', 'Amarelo']])}</div></section>
      <section><h2 class="text-sm font-bold mb-3">Personagens · 3 opções</h2><div class="flex flex-wrap gap-2">${choices('ps27SetCharacter', ps27.character, [['lucas', 'Lucas'], ['paulo', 'Paulo'], ['lavinia', 'Lavínia']])}</div></section>
      <section><div class="flex items-center justify-between gap-3"><div><h2 class="text-sm font-bold">Data e hora</h2><p class="mt-1 text-zinc-500" style="font-size:.75rem;line-height:1.25rem;">Exibe o adesivo e aceita apenas números.</p></div><button data-action="ps27ToggleDateTime" class="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${ps27.showDateTime ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}">${ps27.showDateTime ? 'Ativado' : 'Adicionar'}</button></div>${ps27.showDateTime ? `<div class="mt-4 space-y-3"><div class="flex flex-wrap gap-2">${choices('ps27SetDateSticker', ps27.dateSticker, [['adesivo-data-amarelo', 'Amarelo'], ['adesivo-data-vermelho', 'Vermelho'], ['adesivo-data-azul', 'Azul']])}</div><div class="flex flex-wrap items-end gap-2"><label class="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Dia<input data-action="ps27SetDatePart" data-part="dateDay" value="${ps27.dateDay}" inputmode="numeric" pattern="[0-9]{2}" maxlength="2" placeholder="DD" class="w-12 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-sm font-bold text-white outline-none focus:border-amber-400" /></label><label class="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Mês<input data-action="ps27SetDatePart" data-part="dateMonth" value="${ps27.dateMonth}" inputmode="numeric" pattern="[0-9]{2}" maxlength="2" placeholder="MM" class="w-12 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-sm font-bold text-white outline-none focus:border-amber-400" /></label><label class="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">Hora<input data-action="ps27SetDatePart" data-part="dateHour" value="${ps27.dateHour}" inputmode="numeric" pattern="[0-9]{2}" maxlength="2" placeholder="17" class="w-12 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-sm font-bold text-white outline-none focus:border-amber-400" /></label></div></div>` : ''}</section>
    </div><section class="flex flex-col gap-3 border-t border-zinc-800 sm:flex-row sm:items-center sm:justify-between" style="margin-top:2.5rem;padding-top:1.25rem;"><div class="flex flex-col"><span class="text-sm font-bold text-white flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Sincronizar formatos</span><p class="mt-1 text-xs text-zinc-500">${ps27.autoSync ? 'Editar um formato altera os demais.' : 'Cada formato mantém seu texto.'}</p></div><button data-action="ps27ToggleAutoSync" class="self-start sm:self-auto flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${ps27.autoSync ? 'bg-amber-400 text-black hover:bg-amber-500' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}">${ps27.autoSync ? 'Sincronizado' : 'Independente'}</button></section></section>
    <div class="mt-12 pt-4 flex flex-col gap-16">${PreviewCard('post')}${PreviewCard('story')}${PreviewCard('campi')}${PreviewCard('portal')}</div>
    </div><footer class="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-zinc-800 p-2 z-50" style="padding-bottom:calc(.5rem + env(safe-area-inset-bottom));"><div class="max-w-2xl mx-auto flex gap-2"><button data-action="ps27NewPost" class="flex-1 bg-zinc-800 text-white text-xs font-semibold py-2 px-2 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700">Novo Post</button><button data-action="ps27ToggleExportMenu" class="flex-1 bg-amber-400 text-black text-xs font-bold py-2 px-2 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200">Exportar tudo</button></div></footer>${ps27.showExportMenu ? `<div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in"><div class="bg-black border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-lg w-[calc(100%-1.5rem)] max-w-sm text-center"><h2 class="text-2xl font-bold mb-4">Exportar imagens</h2><p class="text-zinc-400 mb-2">Post, Story, Portal dos Campi e Portal Principal serão exportados.</p><p class="text-zinc-400 mb-6">JPG é recomendado para arquivos menores; PNG preserva a imagem sem compressão e será maior.</p><div class="flex flex-col sm:flex-row gap-3 sm:gap-4"><button data-action="ps27ExportAll" data-type="jpg" class="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200">JPG · Recomendado</button><button data-action="ps27ExportAll" data-type="png" class="flex-1 bg-zinc-800 border border-zinc-700 text-white font-bold py-3 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-zinc-400">PNG</button></div><button data-action="ps27ToggleExportMenu" class="mt-6 text-red-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 rounded">Cancelar</button></div></div>` : ''}</div>`;
}
function update(key, value) { state.ps27[key] = value; persistPs27(); window.renderApp(); }
window.openPs27 = () => { state.mode = 'ps27'; window.renderApp(); ensureAssets().then(() => Object.keys(formats).forEach(renderCanvas)).catch(() => window.mancheteApp.showFeedback('Não foi possível carregar todos os elementos do PS27.', 'error')); };
window.closePs27 = () => { state.mode = 'manchetes'; window.renderApp(); };
window.ps27SetFormat = (value) => update('format', value);
window.ps27SetSlogan = (value) => update('slogan', value);
window.ps27SetSticker = (value) => update('sticker', value);
window.ps27SetCharacter = (value) => update('character', value);
window.ps27ToggleDateTime = () => update('showDateTime', !state.ps27.showDateTime);
window.ps27SetDateSticker = (value) => update('dateSticker', value);
window.ps27SetDatePart = (part, value, input) => {
  if (!['dateDay', 'dateMonth', 'dateHour'].includes(part)) return;
  state.ps27[part] = String(value).replace(/\D/g, '').slice(0, 2);
  if (input) input.value = state.ps27[part];
  persistPs27();
  Object.keys(formats).forEach(renderCanvas);
};
window.ps27SetHeadline = (value, formatId) => { const targets = state.ps27.autoSync ? Object.keys(formats) : [formatId]; targets.forEach((id) => { state.ps27.headlines[id] = value; const editor = document.querySelector(`[data-action="ps27SetHeadline"][data-format="${id}"]`); if (editor && editor !== document.activeElement) editor.textContent = value; renderCanvas(id); }); persistPs27(); };
window.ps27SyncText = () => { const source = document.activeElement?.dataset?.format || 'post'; const value = getHeadline(source); state.ps27.headlines = Object.fromEntries(Object.keys(formats).map((id) => [id, value])); persistPs27(); window.renderApp(); };
const ps27Targets = (formatId) => state.ps27.autoSync ? formatIds : [formatId];
const ps27FormatFromElement = (element) => element.dataset.format || element.closest('[id^="headline-box-"]')?.id.replace('headline-box-', '');
function syncPs27Metadata(collection, action, value, formatId) {
  ps27Targets(formatId).forEach((id) => { state.ps27[collection][id] = value; renderCanvas(id); });
  document.querySelectorAll(`[data-action="${action}"]`).forEach((editor) => {
    const editorFormat = ps27FormatFromElement(editor);
    if (editorFormat !== formatId && state.ps27.autoSync) editor.textContent = value;
  });
}
window.ps27ToggleAutoSync = () => { state.ps27.autoSync = !state.ps27.autoSync; if (state.ps27.autoSync) { const source = document.activeElement?.dataset?.format || 'post'; state.ps27.headlines = Object.fromEntries(formatIds.map((id) => [id, getHeadline(source)])); ['eyebrows', 'subtitles', 'showEyebrows', 'showSubtitles'].forEach((key) => { state.ps27[key] = Object.fromEntries(formatIds.map((id) => [id, state.ps27[key][source]])); }); } persistPs27(); window.renderApp(); };
window.ps27BeginText = (element) => { const formatId = ps27FormatFromElement(element); if (element.dataset.rendered) { element.textContent = element.dataset.richText === 'headline' ? getHeadline(formatId) : getSubtitle(formatId); delete element.dataset.rendered; } const placeholder = element.dataset.placeholder; if (!placeholder || element.textContent.trim() !== placeholder) return; element.textContent = ''; if (element.dataset.action === 'ps27SetHeadline') ps27Targets(formatId).forEach((id) => { state.ps27.headlines[id] = ''; renderCanvas(id); }); else if (element.dataset.action === 'ps27SetEyebrow') syncPs27Metadata('eyebrows', 'ps27SetEyebrow', '', formatId); else if (element.dataset.action === 'ps27SetSubtitle') syncPs27Metadata('subtitles', 'ps27SetSubtitle', '', formatId); persistPs27(); };
window.ps27RenderRichText = (element) => { const formatId = ps27FormatFromElement(element); const value = element.dataset.richText === 'headline' ? getHeadline(formatId) : getSubtitle(formatId); if (!element.dataset.richText || !value) return; element.innerHTML = window.richTextService.renderRichTextHtml(value); element.dataset.rendered = 'true'; };
window.ps27ToggleEyebrow = (formatId) => { ps27Targets(formatId).forEach((id) => { state.ps27.showEyebrows[id] = !showsEyebrow(formatId); if (state.ps27.showEyebrows[id] && !getEyebrow(id)) state.ps27.eyebrows[id] = 'Editoria'; }); persistPs27(); window.renderApp(); };
window.ps27ToggleSubtitle = (formatId) => { ps27Targets(formatId).forEach((id) => { state.ps27.showSubtitles[id] = !showsSubtitle(formatId); if (state.ps27.showSubtitles[id] && !getSubtitle(id)) state.ps27.subtitles[id] = 'Seu subtítulo aqui'; }); persistPs27(); window.renderApp(); };
window.ps27SetEyebrow = (value, formatId) => { syncPs27Metadata('eyebrows', 'ps27SetEyebrow', value, formatId); persistPs27(); };
window.ps27SetSubtitle = (value, formatId) => { syncPs27Metadata('subtitles', 'ps27SetSubtitle', value, formatId); persistPs27(); };
window.ps27NewPost = () => { state.ps27.headlines = Object.fromEntries(formatIds.map((id) => [id, 'Digite o seu texto aqui'])); state.ps27.eyebrows = Object.fromEntries(formatIds.map((id) => [id, 'Editoria'])); state.ps27.subtitles = Object.fromEntries(formatIds.map((id) => [id, 'Seu subtítulo aqui'])); persistPs27(); window.renderApp(); };
window.ps27ToggleExportMenu = () => { state.ps27.showExportMenu = !state.ps27.showExportMenu; window.renderApp(); };
window.ps27Download = async (formatId, type) => {
  try {
    await ensureAssets(); const format = formats[formatId]; const canvas = document.createElement('canvas'); canvas.width = format.width; canvas.height = format.height; renderSocial(canvas.getContext('2d'), formatId);
    downloadPs27Canvas(canvas, format, type);
  } catch (error) { console.error('Falha ao exportar PS27.', error); window.mancheteApp.showFeedback('Não foi possível exportar a arte. Recarregue a página e tente novamente.', 'error'); }
};
window.ps27ExportAll = (type, event) => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (!assetsReady) { window.mancheteApp.showFeedback('Aguarde o carregamento das artes antes de exportar.', 'error'); return; }
  const label = button.textContent; button.disabled = true; button.textContent = 'Exportando...';
  try { Object.keys(formats).forEach((formatId) => { const format = formats[formatId]; const canvas = document.createElement('canvas'); canvas.width = format.width; canvas.height = format.height; renderSocial(canvas.getContext('2d'), formatId); downloadPs27Canvas(canvas, format, type); }); state.ps27.showExportMenu = false; window.renderApp(); window.mancheteApp.showFeedback('As quatro artes foram enviadas para download.', 'success'); }
  catch (error) { console.error('Falha ao exportar o lote PS27.', error); button.disabled = false; button.textContent = label; window.mancheteApp.showFeedback('Não foi possível exportar o lote. Tente novamente.', 'error'); }
};
window.ps27Module = { Ps27Screen, renderCanvas };
})();
