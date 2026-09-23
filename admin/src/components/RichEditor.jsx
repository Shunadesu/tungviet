import { useMemo, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiFile } from 'react-icons/fi';

/**
 * Rich editor tối giản dựa trên Quill.
 * Toolbar minimal: bold/italic/underline/strike, list (ordered/bullet), link, heading, clean.
 * Lưu ý: chỉ whitelist các tag HTML ở client qua utils/sanitize.js.
 *
 * Props:
 *  - value, onChange, placeholder (string)
 *  - minHeight: px (default 160)
 *  - maxLength: optional char counter
 *  - onUploadPDF: optional handler nhận file -> upload -> trả về URL
 *  - toolbar: optional array config thay thế toolbar mặc định (VD: [['bold', 'italic']])
 *
 * NOTE: ReactQuill gọi onChange liên tục (selection change, focus, etc.).
 * Ta wrap onChange để chỉ bubble ra ngoài khi value thay đổi thực sự -> tránh
 * vòng lặp "re-render -> setState -> re-render" vô hạn.
 */
const RichEditor = ({
  value,
  onChange,
  placeholder,
  minHeight = 160,
  maxLength,
  onUploadPDF,
  toolbar,
}) => {
  const quillRef = useRef(null);
  const lastValueRef = useRef(value || '');

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbar || [
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ header: [1, 2, 3, false] }],
          ['link'],
          ['clean'],
        ],
        handlers: {
          link(value) {
            const quill = this.quill;
            if (value) {
              const url = prompt('Enter URL:');
              if (url) quill.format('link', url);
            } else {
              quill.format('link', false);
            }
          },
        },
      },
    }),
    [toolbar]
  );

  const formats = useMemo(
    () => {
      if (toolbar) {
        // Flatten toolbar array to collect all used format keys
        const keys = new Set();
        toolbar.forEach((group) => {
          if (Array.isArray(group)) group.forEach((item) => keys.add(item));
        });
        return Array.from(keys);
      }
      return ['bold', 'italic', 'underline', 'strike', 'list', 'header', 'link'];
    },
    [toolbar]
  );

  const handleChange = useCallback(
    (next) => {
      if (typeof next === 'string' && next === lastValueRef.current) return;
      lastValueRef.current = next;
      onChange?.(next);
    },
    [onChange]
  );

  // Đồng bộ ref khi value từ prop thay đổi từ bên ngoài (ví dụ reset form, mở edit khác).
  useEffect(() => {
    const next = value || '';
    if (next !== lastValueRef.current) {
      lastValueRef.current = next;
    }
  }, [value]);

  const handleInsertPDFLink = () => {
    if (!onUploadPDF) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const result = await onUploadPDF(file);
        const url = result?.data?.data?.url;
        if (url) {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            const fullUrl = window.location.origin + url;
            quill.insertText(range?.index || 0, `[Tải PDF: ${file.name}](${fullUrl})`);
          }
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };
    input.click();
  };

  const length = (value || '').replace(/<[^>]*>/g, '').length;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <ReactQuill
        ref={quillRef}
        value={value || ''}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        className="rich-editor-quill"
      />
      {onUploadPDF && (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-t bg-gray-50 text-xs">
          <button
            type="button"
            onClick={handleInsertPDFLink}
            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Insert PDF Link"
          >
            <FiFile size={12} />
            Đính kèm PDF
          </button>
        </div>
      )}
      {maxLength && (
        <div
          className={`px-2 py-1 text-[10px] text-right border-t bg-gray-50 ${
            length > maxLength ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {length}/{maxLength}
        </div>
      )}
      <style>{`
        .rich-editor-quill .ql-container {
          min-height: ${minHeight}px;
          font-size: 14px;
        }
        .rich-editor-quill .ql-editor {
          min-height: ${minHeight}px;
        }
        .rich-editor-quill .ql-editor p {
          margin-bottom: 0.5em;
        }
        .rich-editor-quill .ql-editor ul,
        .rich-editor-quill .ql-editor ol {
          padding-left: 1.5em;
        }
        .rich-editor-quill .ql-editor a {
          color: #2563eb;
          text-decoration: underline;
        }
        .rich-editor-quill .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default RichEditor;