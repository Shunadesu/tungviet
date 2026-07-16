import { useEffect } from 'react';

const SeoMeta = ({ seo, faviconUrl }) => {
  useEffect(() => {
    if (!seo) return;

    const title = seo.defaultTitle || 'Zuna Tungviet';
    document.title = title;

    const setMeta = (name, content, isProperty = false) => {
      const sel = isProperty
        ? document.querySelector(`meta[property="${name}"]`)
        : document.querySelector(`meta[name="${name}"]`);
      let el = sel || (isProperty
        ? Object.assign(document.createElement('meta'), { property: name })
        : Object.assign(document.createElement('meta'), { name }));
      el.content = content;
      if (!el.parentNode) document.head.appendChild(el);
    };

    setMeta('description', seo.defaultDescription || '', false);
    setMeta('keywords', seo.defaultKeywords || '', false);
    setMeta('og:title', seo.defaultTitle || title, true);
    setMeta('og:description', seo.defaultDescription || '', true);
    if (seo.ogImage) setMeta('og:image', seo.ogImage, true);
    setMeta('og:site_name', title, true);
    setMeta('twitter:card', 'summary_large_image', false);
    setMeta('twitter:title', seo.defaultTitle || title, false);
    setMeta('twitter:description', seo.defaultDescription || '', false);
    if (seo.ogImage) setMeta('twitter:image', seo.ogImage, false);
  }, [seo]);

  useEffect(() => {
    if (!faviconUrl) return;
    const existing = document.querySelector("link[rel='icon']");
    if (existing) {
      existing.href = faviconUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }, [faviconUrl]);

  return null;
};

export default SeoMeta;
