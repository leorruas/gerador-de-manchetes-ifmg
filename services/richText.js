(() => {
const FONT_FAMILY = 'Archivo';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tokenizeSegment(text, bold) {
  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part) => ({ text: part, bold, isWhitespace: /^\s+$/.test(part) }));
}

function trimLine(tokens) {
  while (tokens.length && tokens[0].isWhitespace) tokens.shift();
  while (tokens.length && tokens[tokens.length - 1].isWhitespace) tokens.pop();
  return tokens;
}

function measureToken(context, token, fontSize) {
  context.font = `${token.bold ? '700' : '400'} ${fontSize}px ${FONT_FAMILY}`;
  return context.measureText(token.text).width;
}

function parseRichText(text) {
  return text.split('\n').map((paragraph) => {
    const parts = paragraph.split('**');
    return parts
      .map((part, index) => ({
        text: part,
        bold: index % 2 === 1,
      }))
      .filter((segment) => segment.text.length > 0);
  });
}

function renderRichTextHtml(text) {
  return parseRichText(text)
    .map((paragraph) => {
      if (paragraph.length === 0) return '<span class="block w-full text-left">&nbsp;</span>';

      const content = paragraph
        .map((segment) => `<span class="${segment.bold ? 'font-bold' : 'font-normal'}">${escapeHtml(segment.text)}</span>`)
        .join('');

      return `<span class="block w-full text-left">${content}</span>`;
    })
    .join('');
}

function buildRichTextLines(context, text, maxWidth, fontSize) {
  const paragraphs = parseRichText(text);
  const lines = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const tokens = paragraph.flatMap((segment) => tokenizeSegment(segment.text, segment.bold));

    if (tokens.length === 0) {
      lines.push([]);
    } else {
      let currentLine = [];
      let currentWidth = 0;

      tokens.forEach((token) => {
        const tokenWidth = measureToken(context, token, fontSize);
        const exceedsWidth = currentWidth + tokenWidth > maxWidth;

        if (exceedsWidth && currentLine.length > 0 && !token.isWhitespace) {
          lines.push(trimLine(currentLine));
          currentLine = [];
          currentWidth = 0;
        }

        if (currentLine.length === 0 && token.isWhitespace) {
          return;
        }

        currentLine.push(token);
        currentWidth += tokenWidth;
      });

      lines.push(trimLine(currentLine));
    }

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push([]);
    }
  });

  return lines;
}

window.richTextService = {
  parseRichText,
  renderRichTextHtml,
  buildRichTextLines,
};
})();
