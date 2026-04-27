// Orquestra a exportacao: fonte, canvas, imagem base, overlay de texto e download final.
(() => {
const { getFilename, drawRoundedRect } = window.canvasExportHelpers;
const { drawTextOverlay } = window.canvasExportText;

function getImageDrawBox(format, baseImageElement, transform) {
  const containerAspectRatio = format.width / format.height;
  const imageAspectRatio = baseImageElement.naturalWidth / baseImageElement.naturalHeight;
  const fitMode = transform.fitMode || 'cover';
  let baseWidth, baseHeight;
  if (fitMode === 'contain') {
      const containScale = 0.90;
      if (imageAspectRatio > containerAspectRatio) {
          baseWidth = format.width * containScale;
          baseHeight = (format.width / imageAspectRatio) * containScale;
      } else {
          baseHeight = format.height * containScale;
          baseWidth = (format.height * imageAspectRatio) * containScale;
      }
  } else if (imageAspectRatio > containerAspectRatio) {
      baseHeight = format.height;
      baseWidth = format.height * imageAspectRatio;
  } else {
      baseWidth = format.width;
      baseHeight = format.width / imageAspectRatio;
  }
  const targetWidth = baseWidth * (transform.zoom || 1);
  const targetHeight = baseHeight * (transform.zoom || 1);
  const overflowX = Math.max(0, targetWidth - format.width);
  const overflowY = Math.max(0, targetHeight - format.height);
  const underflowX = Math.max(0, format.width - targetWidth);
  const underflowY = Math.max(0, format.height - targetHeight);
  const x = Math.min(1, Math.max(-1, transform.position.x || 0));
  const y = Math.min(1, Math.max(-1, transform.position.y || 0));
  return {
      fitMode,
      targetWidth,
      targetHeight,
      drawX: targetWidth > format.width ? -overflowX / 2 - (x * overflowX / 2) : underflowX / 2 + (x * underflowX / 2),
      drawY: targetHeight > format.height ? -overflowY / 2 - (y * overflowY / 2) : underflowY / 2 + (y * underflowY / 2),
  };
}

function drawBaseImage(ctx, format, baseImageElement, transform) {
  const box = getImageDrawBox(format, baseImageElement, transform);
  ctx.clearRect(0, 0, format.width, format.height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, format.width, format.height);
  if (box.fitMode === 'contain') {
      ctx.save();
      drawRoundedRect(ctx, box.drawX, box.drawY, box.targetWidth, box.targetHeight, format.width * 0.03);
      ctx.clip();
      ctx.drawImage(baseImageElement, box.drawX, box.drawY, box.targetWidth, box.targetHeight);
      ctx.restore();
  } else {
      ctx.drawImage(baseImageElement, box.drawX, box.drawY, box.targetWidth, box.targetHeight);
  }
}

async function downloadCanvas(canvas, format, slug, type) {
  const quality = type === 'jpeg' ? 0.9 : 1.0;
  await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
         console.error('Falha ao gerar o arquivo de imagem final.');
         resolve();
         return;
      }
      const sizeMB = blob.size / (1024 * 1024);
      if (sizeMB > 1.5) {
          const proceed = window.confirm(`ATENÇÃO: A arte "${format.name}" gerou um arquivo muito pesado (${sizeMB.toFixed(2)} MB).\n\nArquivos grandes podem deixar o portal lento e prejudicar o carregamento no celular.\n\nDeseja baixar mesmo assim?`);
          if (!proceed) {
               console.log('Exportação cancelada devido ao tamanho do arquivo.');
               resolve();
               return;
          }
      }
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = getFilename(slug, format, type);
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      resolve();
    }, `image/${type}`, quality);
  });
}

async function generateAndDownloadImage(format, baseImageElement, transform, textContent, textVerticalPercent, slug, type) {
  await document.fonts.load('400 10px Archivo');
  await document.fonts.load('700 10px Archivo');
  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }
  drawBaseImage(ctx, format, baseImageElement, transform);
  await drawTextOverlay(ctx, canvas, format, textContent, textVerticalPercent);
  await downloadCanvas(canvas, format, slug, type);
}

window.canvasExportService = { generateAndDownloadImage };
})();

