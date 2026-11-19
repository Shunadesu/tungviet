const ALLOWED_TAGS = new Set([
  'a', 'b', 'i', 'em', 'strong', 'u', 's', 'p', 'br', 'ul', 'ol', 'li',
  'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody',
  'tr', 'th', 'td',
]);

const ALLOWED_ATTRS = new Set(['href', 'title', 'target', 'rel']);

const stripDangerous = (html) => {
  if (!html || typeof html !== 'string') return '';
  let out = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  out = out.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '');
  out = out.replace(/<embed\b[^>]*>/gi, '');
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, '');
  out = out.replace(/(href|src)\s*=\s*(javascript:[^\s>]+)/gi, '');
  return out;
};

const sanitizeNode = (html) => {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    const isClosing = match.startsWith('</');
    if (isClosing) return `</${tag}>`;

    const cleanedAttrs = [];
    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = attrRegex.exec(attrs)) !== null) {
      const name = m[1].toLowerCase();
      const value = m[3] !== undefined ? m[3] : m[4];
      if (!ALLOWED_ATTRS.has(name)) continue;
      if (name === 'href' && /^\s*javascript:/i.test(value)) continue;
      cleanedAttrs.push(`${name}="${value.replace(/"/g, '&quot;')}"`);
    }

    if (tag === 'a' && !cleanedAttrs.some((a) => a.startsWith('target='))) {
      cleanedAttrs.push('target="_blank"', 'rel="noopener noreferrer"');
    }

    return cleanedAttrs.length ? `<${tag} ${cleanedAttrs.join(' ')}>` : `<${tag}>`;
  });
};

/**
 * Lọc HTML theo whitelist (giống client/src/utils/sanitize.js).
 * @param {string} html
 * @returns {string}
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return sanitizeNode(stripDangerous(html));
};

/**
 * Bỏ tag HTML + entity để lấy text thuần (dùng cho tìm kiếm, tooltip).
 * @param {string} html
 * @returns {string}
 */
export const htmlToText = (html) => {
  if (!html || typeof html !== 'string') return '';
  let text = html
    // Block-level -> thêm khoảng trắng để chữ không bị dính khi bỏ tag
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre|tr|td|th|br)\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, '/');

  // Giải mã entity dạng số (thập phân và hex)
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    const code = Number(dec);
    return Number.isFinite(code) ? String.fromCodePoint(code) : '';
  });
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : '';
  });

  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Loại bỏ các block rỗng do Quill sinh ra (<p><br></p>, <p>&nbsp;</p>...).
 * @param {string} html
 * @returns {string}
 */
export const stripEmptyBlocks = (html) => {
  if (!html || typeof html !== 'string') return '';
  const stripped = html
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '')
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')
    .trim();
  return stripped;
};

export default sanitizeHtml;
