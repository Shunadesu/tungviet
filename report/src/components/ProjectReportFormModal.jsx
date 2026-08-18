import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chưa bắt đầu' },
  { value: 'InProgress', label: 'Đang làm' },
  { value: 'Done', label: 'Hoàn thành' },
  { value: 'Blocked', label: 'Bị chặn' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'Pending',
  progress: 0,
  startDate: '',
  endDate: '',
  assignee: '',
  category: '',
  notes: '',
  tasks: [],
};

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

function ProjectReportFormModal({ open, initialValues, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [quillDescription, setQuillDescription] = useState('');
  const isEdit = Boolean(initialValues?.id || initialValues?._id);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setQuillDescription('');
      return;
    }
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        description: initialValues.description || '',
        status: initialValues.status || 'Pending',
        progress: initialValues.progress ?? 0,
        startDate: formatDate(initialValues.startDate),
        endDate: formatDate(initialValues.endDate),
        assignee: initialValues.assignee || '',
        category: initialValues.category || '',
        notes: initialValues.notes || '',
        tasks: Array.isArray(initialValues.tasks)
          ? initialValues.tasks.map((t) => ({
              _id: t._id || t.id,
              title: t.title || '',
              isDone: Boolean(t.isDone),
              dueDate: formatDate(t.dueDate),
              assignee: t.assignee || '',
              note: t.note || '',
            }))
          : [],
      });
      setQuillDescription(initialValues.description || '');
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    setForm((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: '',
          isDone: false,
          dueDate: '',
          assignee: '',
          note: '',
        },
      ],
    }));
  };

  const handleTaskChange = (idx, patch) => {
    setForm((prev) => {
      const next = [...prev.tasks];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, tasks: next };
    });
  };

  const handleTaskDelete = (idx) => {
    setForm((prev) => {
      const next = [...prev.tasks];
      next.splice(idx, 1);
      return { ...prev, tasks: next };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    const payload = {
      id: initialValues?.id || initialValues?._id,
      stt: initialValues?.stt ?? 0,
      title: form.title.trim(),
      description: quillDescription,
      status: form.status,
      progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      assignee: form.assignee.trim(),
      category: form.category.trim(),
      notes: form.notes,
      tasks: form.tasks
        .filter((t) => t.title && t.title.trim())
        .map((t) => ({
          _id: t._id,
          title: t.title.trim(),
          isDone: Boolean(t.isDone),
          dueDate: t.dueDate || null,
          assignee: (t.assignee || '').trim(),
          note: t.note || '',
        })),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Sửa dự án' : 'Thêm dự án'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên dự án / công việc <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="VD: Thiết kế UI trang chủ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <ReactQuill
              theme="snow"
              value={quillDescription}
              onChange={setQuillDescription}
              modules={quillModules}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 input"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tiến độ (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="progress"
                value={form.progress}
                onChange={handleChange}
                className="mt-1 input"
                placeholder="0 - 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="mt-1 input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="mt-1 input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Người phụ trách
              </label>
              <input
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
                className="mt-1 input"
                placeholder="Tên người chịu trách nhiệm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phân loại
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 input"
                placeholder="VD: Frontend, Backend, Design..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ghi chú dự án
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 input"
              placeholder="Ghi chú chung cho cả dự án (mọi người cùng sửa được)"
            />
          </div>

          {/* Tasks section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                Checklist công việc ({form.tasks.length})
              </h4>
              <button
                type="button"
                onClick={handleAddTask}
                className="btn btn-secondary px-2 py-1 text-xs"
              >
                <FiPlus className="mr-1" />
                Thêm task
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {form.tasks.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  Chưa có task nào. Có thể tạo task tại đây hoặc trên trang chính.
                </p>
              )}
              {form.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(task.isDone)}
                      onChange={(e) =>
                        handleTaskChange(idx, { isDone: e.target.checked })
                      }
                      className="mt-2 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) =>
                          handleTaskChange(idx, { title: e.target.value })
                        }
                        className="input"
                        placeholder="Tên công việc"
                      />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="text-xs text-gray-600">
                          Hạn chót:
                          <input
                            type="date"
                            value={task.dueDate || ''}
                            onChange={(e) =>
                              handleTaskChange(idx, {
                                dueDate: e.target.value,
                              })
                            }
                            className="mt-1 input"
                          />
                        </label>
                        <label className="text-xs text-gray-600">
                          Phụ trách:
                          <input
                            type="text"
                            value={task.assignee}
                            onChange={(e) =>
                              handleTaskChange(idx, {
                                assignee: e.target.value,
                              })
                            }
                            className="mt-1 input"
                            placeholder="Tên người làm"
                          />
                        </label>
                      </div>
                      <textarea
                        value={task.note}
                        onChange={(e) =>
                          handleTaskChange(idx, { note: e.target.value })
                        }
                        rows={2}
                        className="input"
                        placeholder="Ghi chú cho task này..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTaskDelete(idx)}
                      className="text-gray-400 hover:text-red-600"
                      title="Xóa task"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-gray-200 bg-white pt-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Lưu thay đổi' : 'Thêm dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectReportFormModal;
