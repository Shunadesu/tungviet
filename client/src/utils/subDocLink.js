/**
 * Resolves the target link for a sub-document (technology or application).
 * Priority: linkCustomUrl > linkToMainTree
 *
 * @param {object|null} subDoc - The sub-doc object with linkToMainTree and linkCustomUrl
 * @param {string} lang - Current language code ('vi' or 'en')
 * @returns {{ to: string, external: boolean }|null}
 */
export const resolveSubDocLink = (subDoc, lang) => {
  if (!subDoc) return null;

  if (subDoc.linkCustomUrl && String(subDoc.linkCustomUrl).trim()) {
    const url = String(subDoc.linkCustomUrl).trim();
    const isExternal =
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('//');
    return { to: url, external: isExternal };
  }

  if (subDoc.linkToMainTree && subDoc.linkToMainTree._id) {
    return {
      to: `/${lang}/main-trees/${subDoc.linkToMainTree._id}`,
      external: false,
    };
  }

  return null;
};
