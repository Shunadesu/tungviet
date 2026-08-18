import { useState } from 'react';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';
import TaskItem from './TaskItem';

const STATUS_STYLES = {
  Pending: 'bg-gray-100 text-gray-700 border-gray-200',
  InProgress: 'bg-blue-100 text-blue-700 border-blue-200',
  Done: 'bg-green-100 text-green-700 border-green-200',
  Blocked: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABELS = {
  Pending: 'Chưa bắt đầu',
  InProgress: 'Đang làm',
  Done: 'Hoàn thành',
  Blocked: 'Bị chặn',
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

function ProjectReportTable({ items, onEdit, onDelete, onChangeProject }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTaskChange = (projectId, taskIndex, newTask) => {
    const project = items.find((p) => (p._id || p.id) === projectId);
    if (!project) return;
    const newTasks = [...(project.tasks || [])];
    newTasks[taskIndex] = newTask;
    onChangeProject(projectId, { tasks: newTasks });
  };

  const handleTaskDelete = (projectId, taskId) => {
    const project = items.find((p) => (p._id || p.id) === projectId);
    if (!project) return;
    const newTasks = (project.tasks || []).filter(
      (t) => (t._id || t.id) !== taskId
    );
    onChangeProject(projectId, { tasks: newTasks });
  };

  const handleAddTask = (projectId) => {
    const project = items.find((p) => (p._id || p.id) === projectId);
    if (!project) return;
    const newTasks = [
      ...(project.tasks || []),
      {
        title: 'Công việc mới',
        isDone: false,
        dueDate: null,
        assignee: '',
        note: '',
      },
    ];
    onChangeProject(projectId, { tasks: newTasks });
    setExpanded((prev) => ({ ...prev, [projectId]: true }));
  };

  if (!items.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-sm">Chưa có dự án nào. Nhấn "Thêm dự án" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {items.map((project, index) => {
        const id = project._id || project.id;
        const isOpen = expanded[id];
        const tasks = project.tasks || [];
        const doneCount = tasks.filter((t) => t.isDone).length;
        const status = STATUS_STYLES[project.status] || STATUS_STYLES.Pending;
        const statusLabel = STATUS_LABELS[project.status] || 'Chưa bắt đầu';
        const progress = Math.min(
          100,
          Math.max(0, Number(project.progress) || 0)
        );

        return (
          <div key={id || index} className="p-4">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">
                    #{project.stt ?? index + 1}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">
                    {project.title || '(Chưa đặt tên)'}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${status}`}
                  >
                    {statusLabel}
                  </span>
                  {project.category && (
                    <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs text-purple-700">
                      {project.category}
                    </span>
                  )}
                </div>

                {project.description && (
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {stripHtml(project.description)}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  {project.assignee && (
                    <span>
                      <span className="text-gray-400">Phụ trách:</span>{' '}
                      <span className="text-gray-700">{project.assignee}</span>
                    </span>
                  )}
                  {project.startDate && (
                    <span>
                      <span className="text-gray-400">Bắt đầu:</span>{' '}
                      {formatDate(project.startDate)}
                    </span>
                  )}
                  {project.endDate && (
                    <span>
                      <span className="text-gray-400">Kết thúc:</span>{' '}
                      {formatDate(project.endDate)}
                    </span>
                  )}
                  <span>
                    <span className="text-gray-400">Task:</span>{' '}
                    {doneCount}/{tasks.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {progress}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(id)}
                  className="btn btn-secondary px-2 py-1 text-xs"
                  title={isOpen ? 'Thu gọn' : 'Mở rộng'}
                >
                  {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  className="btn btn-secondary px-2 py-1 text-xs"
                  title="Sửa"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(id)}
                  className="btn btn-danger px-2 py-1 text-xs"
                  title="Xóa"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {/* Project notes */}
            {project.notes && (
              <div className="mt-3 rounded-md bg-primary-50 border border-primary-200 px-3 py-2 text-xs text-gray-700">
                <p className="font-medium text-primary mb-1">Ghi chú dự án:</p>
                <p className="whitespace-pre-wrap break-words">
                  {project.notes}
                </p>
              </div>
            )}

            {/* Tasks expanded */}
            {isOpen && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-gray-500">
                    Checklist ({doneCount}/{tasks.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddTask(id)}
                    className="btn btn-secondary px-2 py-1 text-xs"
                  >
                    <FiPlus className="mr-1" />
                    Thêm task
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <p className="text-xs text-gray-400 italic px-3 py-2">
                    Chưa có task nào.
                  </p>
                ) : (
                  tasks.map((task, tIdx) => (
                    <TaskItem
                      key={task._id || task.id || tIdx}
                      task={task}
                      onChange={(newTask) =>
                        handleTaskChange(id, tIdx, newTask)
                      }
                      onDelete={(taskId) => handleTaskDelete(id, taskId)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProjectReportTable;
