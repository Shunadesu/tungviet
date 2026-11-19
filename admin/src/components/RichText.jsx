import { useMemo } from 'react';
import { sanitizeHtml, stripEmptyBlocks, htmlToText } from '../utils/sanitize';

/**
 * Hiển thị nội dung HTML (React Quill / rich text) đã được sanitize.
 * - Dùng `dangerouslySetInnerHTML` với HTML đã lọc whitelist tag/attribute.
 * - Chuẩn hoá &nbsp; thành khoảng trắng thật, bỏ block rỗng của Quill.
 *
 * Props:
 *  - html: string (HTML gốc)
 *  - className: class cho wrapper
 *  - clamp: số dòng tối đa (undefined = không giới hạn)
 *  - fallback: nội dung khi rỗng (mặc định '—')
 *  - title: nội dung tooltip (mặc định lấy text thuần đã rút gọn)
 */
const RichText = ({ html, className = '', clamp, fallback = '—', title }) => {
  const { cleanHtml, plainText } = useMemo(() => {
    const text = htmlToText(html);
    if (!text) return { cleanHtml: '', plainText: '' };

    // 1) Bỏ block rỗng của Quill (<p><br></p>, <p>&nbsp;</p>) TRƯỚC khi đổi &nbsp;
    let out = stripEmptyBlocks(html);

    // 2) Sanitize theo whitelist tag/attribute (loại script, on*, javascript:, ...)
    out = sanitizeHtml(out);

    // 3) &nbsp; -> khoảng trắng thật để chữ xuống dòng được (nbsp chặn wrap)
    out = out.replace(/&nbsp;/gi, ' ');

    // 4) Bỏ <p></p> rỗng còn sót lại sau bước 3
    out = out.replace(/<p>\s*<\/p>/gi, '');

    return { cleanHtml: out.trim(), plainText: text };
  }, [html]);

  if (!cleanHtml) {
    return <span className="text-gray-400">{fallback}</span>;
  }

  // Giới hạn theo số dòng bằng max-height (line-clamp không hoạt động tốt với block con <p>/<ul>).
  // rich-text-content dùng leading-normal = 1.5em mỗi dòng.
  const style = clamp
    ? { maxHeight: `${clamp * 1.5}em`, overflow: 'hidden' }
    : undefined;

  return (
    <div
      className={`rich-text-content ${className}`}
      style={style}
      title={title ?? plainText}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default RichText;
