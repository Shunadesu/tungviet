import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiFile } from 'react-icons/fi';

const RichEditor = ({ value, onChange, placeholder, onUploadPDF }) => {
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
      handlers: {
        link: function (value) {
          const quill = this.quill;
          if (value) {
            const range = quill.getSelection();
            const url = prompt('Enter URL:');
            if (url) {
              quill.format('link', url);
            }
          } else {
            quill.format('link', false);
          }
        },
      },
    },
  }), []);

  const formats = useMemo(() => [
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link',
  ], []);

  const handleInsertPDFLink = async () => {
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
            if (range && range.length > 0) {
              quill.deleteText(range.index, range.length);
            }
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) quill.format('bold');
            }}
            className="px-2 py-1 text-xs font-bold hover:bg-gray-200 rounded transition-colors"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) quill.format('italic');
            }}
            className="px-2 py-1 text-xs italic hover:bg-gray-200 rounded transition-colors"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) quill.format('underline');
            }}
            className="px-2 py-1 text-xs underline hover:bg-gray-200 rounded transition-colors"
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) quill.format('strike');
            }}
            className="px-2 py-1 text-xs line-through hover:bg-gray-200 rounded transition-colors"
            title="Strikethrough"
          >
            S
          </button>
          <span className="w-px h-5 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection();
                quill.format('list', range ? 'ordered' : 'ordered');
              }
            }}
            className="px-2 py-1 text-xs hover:bg-gray-200 rounded transition-colors"
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection();
                quill.format('list', range ? 'bullet' : 'bullet');
              }
            }}
            className="px-2 py-1 text-xs hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const url = prompt('Enter URL:');
                if (url) quill.format('link', url);
              }
            }}
            className="px-2 py-1 text-xs hover:bg-gray-200 rounded transition-colors"
            title="Insert Link"
          >
            🔗
          </button>
        </div>
        {onUploadPDF && (
          <button
            type="button"
            onClick={handleInsertPDFLink}
            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Insert PDF Link"
          >
            <FiFile size={12} />
            PDF
          </button>
        )}
      </div>
      <ReactQuill
        ref={quillRef}
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        className="rich-editor-quill"
      />
      <style>{`
        .rich-editor-quill .ql-container {
          min-height: 150px;
          font-size: 14px;
        }
        .rich-editor-quill .ql-editor {
          min-height: 150px;
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
      `}</style>
    </div>
  );
};

export default RichEditor;
