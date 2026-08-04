/**
 * Normalize a market document so the UI doesn't have to know whether the
 * backend exposed the legacy `name`/`nameEn` fields or the current
 * `title`/`titleEn` fields. Falls back gracefully when a field is missing.
 */
export const getMarketTitle = (market, lang = 'vi') => {
  if (!market) return '';
  if (lang === 'en') {
    return market.titleEn || market.nameEn || market.title || market.name || '';
  }
  return market.title || market.name || '';
};

export const getMarketDescription = (market, lang = 'vi') => {
  if (!market) return '';
  if (lang === 'en') {
    return (
      market.descriptionEn ||
      market.description ||
      ''
    );
  }
  return market.description || '';
};

export const getMarketImage = (market) => market?.imageUrl || '';

export const getMarketTdsUrl = (market) => market?.tdsUrl || '';