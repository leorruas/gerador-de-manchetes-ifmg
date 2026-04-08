(() => {
const FONT_FAMILY = "'Archivo', sans-serif";

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
      if (paragraph.length === 0) return '<span class="block w-full text-left" style="text-wrap: pretty;">&nbsp;</span>';

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

      return `<span class="block w-full text-left" style="text-wrap: pretty;">${content}</span>`;
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

function measureTokensWidth(context, tokens, baseFont) {
  return tokens.reduce((total, token) => total + measureToken(context, token, baseFont), 0);
}

function buildWordUnits(tokens) {
  const units = [];
  let currentTokens = [];
  let currentGap = [];

  tokens.forEach((token) => {
    if (token.isWhitespace) {
      if (currentTokens.length > 0) currentGap.push(token);
      return;
    }

    if (currentTokens.length === 0) {
      currentTokens.push(token);
      return;
    }

    if (currentGap.length > 0) {
      units.push({ tokens: currentTokens, gapTokens: currentGap });
      currentTokens = [token];
      currentGap = [];
      return;
    }

    currentTokens.push(token);
  });

  if (currentTokens.length > 0) {
    units.push({ tokens: currentTokens, gapTokens: [] });
  }

  return units;
}

function buildBalancedLines(context, units, baseFont, maxWidth) {
  if (units.length === 0) return [];
  if (units.length === 1) return [units[0].tokens];

  const n = units.length;
  const wordWidths = units.map((unit) => measureTokensWidth(context, unit.tokens, baseFont));
  const gapWidths = units.map((unit) => measureTokensWidth(context, unit.gapTokens, baseFont));
  const prefixWordWidths = [0];
  const prefixGapWidths = [0];

  for (let i = 0; i < n; i += 1) {
    prefixWordWidths.push(prefixWordWidths[i] + wordWidths[i]);
    prefixGapWidths.push(prefixGapWidths[i] + gapWidths[i]);
  }

  function getLineWidth(start, end) {
    const wordsWidth = prefixWordWidths[end + 1] - prefixWordWidths[start];
    const gapsWidth = end > start ? prefixGapWidths[end] - prefixGapWidths[start] : 0;
    return wordsWidth + gapsWidth;
  }

  const costs = new Array(n + 1).fill(Infinity);
  const breaks = new Array(n).fill(n - 1);
  costs[n] = 0;

  for (let start = n - 1; start >= 0; start -= 1) {
    for (let end = start; end < n; end += 1) {
      const lineWidth = getLineWidth(start, end);
      const singleLongWord = start === end && lineWidth > maxWidth;

      if (lineWidth > maxWidth && !singleLongWord) break;

      const slack = Math.max(0, maxWidth - lineWidth);
      let penalty = slack * slack;

      if (end === n - 1) {
        penalty *= 0.65;
        if (start > 0 && lineWidth < maxWidth * 0.35) {
          penalty += maxWidth * maxWidth;
        }
      } else if (lineWidth < maxWidth * 0.45) {
        penalty += slack * slack * 0.35;
      }

      const totalCost = penalty + costs[end + 1];
      if (totalCost < costs[start]) {
        costs[start] = totalCost;
        breaks[start] = end;
      }
    }
  }

  const lines = [];
  let start = 0;

  while (start < n) {
    const end = breaks[start];
    const line = [];

    for (let index = start; index <= end; index += 1) {
      line.push(...units[index].tokens);
      if (index < end) {
        line.push(...units[index].gapTokens);
      }
    }

    lines.push(trimLine(line));
    start = end + 1;
  }

  return lines;
}

function parseRichTextToLines(context, text, baseFont, maxWidth) {
  if (!text || String(text).trim() === '') return [];
  const paragraphs = parseRichText(String(text));
  const lines = [];

  const oldFont = context.font;

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const tokens = paragraph.flatMap((segment) => tokenizeSegment(segment.text, segment.bold, segment.italic, segment.highlight));

    if (tokens.length === 0) {
      lines.push([]);
    } else {
      const units = buildWordUnits(tokens);
      lines.push(...buildBalancedLines(context, units, baseFont, maxWidth));
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
  context.textAlign = 'left';
  
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
