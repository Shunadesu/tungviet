import { useState } from 'react';
import { FiTrash2, FiCheck, FiEdit3, FiSave, FiX } from 'react-icons/fi';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

function TaskItem({ task, onChange, onDelete }) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(task.note || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title || '');

  const updateField = (patch) => {
    onChange({ ...task, ...patch });
  };

  const handleSaveNote = () => {
    updateField({ note: noteDraft });
    setEditingNote(false);
  };

  const handleCancelNote = () => {
    setNoteDraft(task.note || '');
    setEditingNote(false);
  };

  const handleSaveTitle = () => {
    const next = titleDraft.trim();
    if (!next) {
      setTitleDraft(task.title || '');
    } else {
      updateField({ title: next });
    }
    setEditingTitle(false);
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
          checked={Boolean(task.isDone)}
          onChange={(e) => updateField({ isDone: e.target.checked })}
        />
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTitleDraft(task.title || '');
                    setEditingTitle(false);
                  }
                }}
                className="input flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="btn btn-primary px-2 py-1"
                title="Lưu"
              >
                <FiSave />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(task.title || '');
                  setEditingTitle(false);
                }}
                className="btn btn-secondary px-2 py-1"
                title="Hủy"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium break-words ${
                  task.isDone ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {task.title || '(Chưa đặt tên)'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(task.title || '');
                  setEditingTitle(true);
                }}
                className="text-gray-400 hover:text-primary"
                title="Đổi tên"
              >
                <FiEdit3 size={14} />
              </button>
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <label className="flex items-center gap-1">
              <span>Hạn:</span>
              <input
                type="date"
                value={formatDate(task.dueDate)}
                onChange={(e) =>
                  updateField({ dueDate: e.target.value || null })
                }
                className="rounded border-gray-300 text-xs focus:border-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center gap-1">
              <span>Phụ trách:</span>
              <input
                type="text"
                placeholder="Tên người làm"
                value={task.assignee || ''}
                onChange={(e) => updateField({ assignee: e.target.value })}
                className="w-32 rounded border-gray-300 text-xs focus:border-primary focus:ring-primary"
              />
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task._id || task.id)}
          className="text-gray-400 hover:text-red-600"
          title="Xóa task"
        >
          <FiTrash2 />
        </button>
      </div>

      {/* Note section */}
      <div className="pl-7">
        {editingNote ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              className="input"
              placeholder="Ghi chú cho task này..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveNote}
                className="btn btn-primary px-3 py-1 text-xs"
              >
                <FiCheck className="mr-1" />
                Lưu ghi chú
              </button>
              <button
                type="button"
                onClick={handleCancelNote}
                className="btn btn-secondary px-3 py-1 text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div>
            {task.note ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                <p className="whitespace-pre-wrap break-words">{task.note}</p>
                <button
                  type="button"
                  onClick={() => {
                    setNoteDraft(task.note || '');
                    setEditingNote(true);
                  }}
                  className="mt-1 text-[11px] text-amber-700 hover:underline"
                >
                  Sửa ghi chú
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNoteDraft('');
                  setEditingNote(true);
                }}
                className="text-xs text-primary hover:underline"
              >
                + Thêm ghi chú
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
