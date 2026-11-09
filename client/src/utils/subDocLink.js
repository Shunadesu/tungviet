/**
 * Resolves the target link for a sub-document (technology or application).
 *
 * The public API returns `linkToMainTree` as an ARRAY of populated MainTree
 * documents (`_id`, `name`, `nameEn`, `slug`), and applications may also carry
 * a `linkCustomUrl`. This helper normalises both shapes into a single
 * `{ to, external }` descriptor that the UI can render directly.
 *
 * @param {object|null} subDoc - The sub-doc object with linkToMainTree / linkCustomUrl
 * @param {string} lang - Current language code ('vi' or 'en')
 * @returns {{ to: string, external: boolean }|null}
 */
export const resolveSubDocLink = (subDoc, lang) => {
  if (!subDoc) return null;

  // 1. Custom URL takes priority (may be internal path or external site).
  const custom = typeof subDoc.linkCustomUrl === 'string' ? subDoc.linkCustomUrl.trim() : '';
  if (custom) {
    const isExternal = /^https?:\/\//i.test(custom);
    return {
      to: isExternal ? custom : `/${lang}${custom.startsWith('/') ? '' : '/'}${custom}`,
      external: isExternal,
    };
  }

  // 2. Linked main tree (cây ngành sản phẩm) — array or single object.
  const raw = subDoc.linkToMainTree;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const first = list.find((item) => item && item._id);
  if (first) {
    return {
      to: `/${lang}/main-trees/${first._id}`,
      external: false,
    };
  }

  return null;
};

/**
 * Collects the linked main trees (cây ngành) of a sub-document.
 * Always returns an array of `{ _id, name, nameEn, slug }`-like objects.
 *
 * @param {object|null} subDoc
 * @returns {Array<object>}
 */
export const getSubDocMainTrees = (subDoc) => {
  if (!subDoc) return [];
  const raw = subDoc.linkToMainTree;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.filter((item) => item && item._id);
};

/**
 * Collects the linked product lines (danh mục sản phẩm) of a sub-document.
 *
 * @param {object|null} subDoc
 * @returns {Array<object>}
 */
export const getSubDocProductLines = (subDoc) => {
  if (!subDoc) return [];
  const entries = Array.isArray(subDoc.productLineEntries) ? subDoc.productLineEntries : [];
  return entries
    .map((entry) => entry?.productLineId)
    .filter((line) => line && line._id);
};

export default resolveSubDocLink;
