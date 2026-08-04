/**
 * Convert HTML produced by Quill / rich-text editors into plain text suitable
 * for cards, SEO snippets, tooltips, and any other place where we render as
 * a string instead of via `dangerouslySetInnerHTML`.
 *
 * - Decodes HTML entities (`&nbsp;`, `&amp;`, `&lt;`, `&gt;`, `&quot;`,
 *   `&#39;`, numeric refs).
 * - Removes tags but keeps the surrounding whitespace, then collapses runs
 *   of whitespace into single spaces.
 */
export const htmlToText = (html = '') => {
  if (!html || typeof html !== 'string') return '';
  let text = html;

  // Add spaces around block-level tags so words don't get glued together when
  // tags are removed (e.g. "<p>foo</p><p>bar</p>" → "foo bar").
  text = text.replace(/<\/(p|div|li|h[1-6]|blockquote|pre|tr|td|th|br)\s*>/gi, ' ');
  text = text.replace(/<br\s*\/?>/gi, ' ');

  // Strip remaining tags.
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode the most common named entities. We don't rely on the DOM here so
  // this helper stays usable both in the browser and during SSR/SSG.
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, '/');

  // Decode numeric entities (decimal and hex).
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    const code = Number(dec);
    return Number.isFinite(code) ? String.fromCodePoint(code) : '';
  });
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : '';
  });

  // Collapse whitespace and trim.
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Convenience helper: htmlToText + truncate by character count.
 * Appends an ellipsis when truncation actually happened.
 */
export const htmlToExcerpt = (html = '', max = 160, suffix = '…') => {
  const text = htmlToText(html);
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + suffix;
};

export default htmlToText;