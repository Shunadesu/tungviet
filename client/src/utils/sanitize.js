const ALLOWED_TAGS = new Set([
  'a', 'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li',
  'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody',
  'tr', 'th', 'td',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'title', 'target', 'rel',
]);

const stripDangerous = (html) => {
  if (!html || typeof html !== 'string') return '';
  // Remove script/style/iframe entirely including their content
  let out = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  out = out.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '');
  out = out.replace(/<embed\b[^>]*>/gi, '');
  // Strip event handlers (on*)
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Strip javascript: URLs in href/src
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

export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return sanitizeNode(stripDangerous(html));
};

export default sanitizeHtml;