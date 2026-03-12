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

function parseRichText(text) {
  if (!text) return [];
  // Split by \n first
  return text.split('\n').map((paragraph) => {
    // Split using regex that captures delimiters.
    // **bold**, *italic*, $$highlight$$
    const parts = paragraph.split(/(\*\*.*?\*\*|\*[^*]+\*|\$\$.*?\$\$)/g);
    return parts
      .filter(Boolean)
      .map((part) => {
        let text = part;
        let bold = false;
        let italic = false;
        let highlight = false;

        if (text.startsWith('**') && text.endsWith('**') && text.length >= 4) {
          bold = true;
          text = text.slice(2, -2);
        } else if (text.startsWith('$$') && text.endsWith('$$') && text.length >= 4) {
          highlight = true;
          text = text.slice(2, -2);
        } else if (text.startsWith('*') && text.endsWith('*') && text.length >= 2) {
          italic = true;
          text = text.slice(1, -1);
        }

        return { text, bold, italic, highlight };
      })
      .filter((segment) => segment.text.length > 0);
  });
}

function renderRichTextHtml(text) {
  if (!text) return '';
  return parseRichText(text)
    .map((paragraph) => {
      if (paragraph.length === 0) return '<span class="block w-full text-left">&nbsp;</span>';

      const content = paragraph
        .map((segment) => {
           let classes = [];
           if (segment.bold) classes.push('font-bold');
           if (segment.italic) classes.push('italic');
           if (segment.highlight) classes.push('text-[#22c55e]', 'font-bold'); // IFMG Green/Emerald
           
           if (classes.length === 0) classes.push('font-normal');

           return `<span class="${classes.join(' ')}">${escapeHtml(segment.text)}</span>`;
        })
        .join('');

      return `<span class="block w-full text-left">${content}</span>`;
    })
    .join('');
}

function tokenizeSegment(text, bold, italic, highlight) {
  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part) => ({ text: part, bold, italic, highlight, isWhitespace: /^\s+$/.test(part) }));
}

function trimLine(tokens) {
  while (tokens.length && tokens[0].isWhitespace) tokens.shift();
  while (tokens.length && tokens[tokens.length - 1].isWhitespace) tokens.pop();
  return tokens;
}

function measureToken(context, token, baseFont) {
  const savedFont = context.font;
  let fontStyle = '';
  if (token.italic && !baseFont.includes('italic')) fontStyle += 'italic ';
  if ((token.bold || token.highlight) && !baseFont.includes('bold')) fontStyle += 'bold ';
  
  context.font = `${fontStyle}${baseFont}`;
  const width = context.measureText(token.text).width;
  context.font = savedFont;
  return width;
}

function parseRichTextToLines(context, text, baseFont, maxWidth) {
  if (!text) return [];
  const paragraphs = parseRichText(text);
  const lines = [];

  const oldFont = context.font;

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const tokens = paragraph.flatMap((segment) => tokenizeSegment(segment.text, segment.bold, segment.italic, segment.highlight));

    if (tokens.length === 0) {
      lines.push([]);
    } else {
      let currentLine = [];
      let currentWidth = 0;

      tokens.forEach((token) => {
        const tokenWidth = measureToken(context, token, baseFont);
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

      if (currentLine.length > 0) {
        lines.push(trimLine(currentLine));
      }
    }

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push([]);
    }
  });

  context.font = oldFont;
  return lines;
}

function drawRichTextLines(context, lines, startX, startY, lineHeight, maxWidth, textColor, isShadowed = false) {
  let currentY = startY;
  const oldFont = context.font;
  const oldBaseline = context.textBaseline;
  const baseFont = context.font;
  
  // Always use 'top' baseline so coordinates are predictable (top of the em box)
  context.textBaseline = 'top';
  
  lines.forEach((line) => {
    let currentX = startX;
    
    line.forEach((segment) => {
      let targetFont = baseFont;
      if (segment.bold || segment.highlight) {
          if (!targetFont.includes('bold')) targetFont = 'bold ' + targetFont;
      }
      if (segment.italic) {
          if (!targetFont.includes('italic')) targetFont = 'italic ' + targetFont;
      }
      
      context.font = targetFont;
      
      if (segment.highlight) {
          context.fillStyle = '#22c55e'; // IFMG Green highlight
      } else {
          context.fillStyle = textColor;
      }

      context.fillText(segment.text, currentX, currentY);
      currentX += context.measureText(segment.text).width;
    });
    
    currentY += lineHeight;
  });
  
  context.font = oldFont;
  context.textBaseline = oldBaseline;
}

// Keep the old buildRichTextLines alias just in case it's used elsewhere for heights
function buildRichTextLines(context, text, maxWidth, fontSize) {
    return parseRichTextToLines(context, text, `${fontSize}px ${FONT_FAMILY}`, maxWidth);
}

window.richTextService = {
  parseRichText,
  renderRichTextHtml,
  buildRichTextLines,
  parseRichTextToLines,
  drawRichTextLines
};
})();
