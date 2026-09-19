/**
 * Resolves the target link for a sub-document (technology or application).
 * Resolves linkToMainTree to an internal path.
 *
 * @param {object|null} subDoc - The sub-doc object with linkToMainTree
 * @param {string} lang - Current language code ('vi' or 'en')
 * @returns {{ to: string, external: boolean }|null}
 */
export const resolveSubDocLink = (subDoc, lang) => {
  if (!subDoc) return null;

  if (subDoc.linkToMainTree && subDoc.linkToMainTree._id) {
    return {
      to: `/${lang}/main-trees/${subDoc.linkToMainTree._id}`,
      external: false,
    };
  }

  return null;
};
