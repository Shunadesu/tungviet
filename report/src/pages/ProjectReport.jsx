import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiSave, FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import ProjectReportTable from '../components/ProjectReportTable';
import ProjectReportFormModal from '../components/ProjectReportFormModal';
import SEO from '../components/SEO';
import Skeleton, {
  TableSkeleton,
  StatsSkeleton,
  RFPHeaderSkeleton,
} from '../components/Skeleton';

const STATUS_LABELS = {
  Pending: 'Chưa bắt đầu',
  InProgress: 'Đang làm',
  Done: 'Hoàn thành',
  Blocked: 'Bị chặn',
};

const isMongoId = (id) =>
  typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

function ProjectReport() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/project-reports');
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setProjects(
            result.data.map((p) => ({ ...p, id: p._id || p.id }))
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch project reports:', error);
      setSaveMessage('Không thể tải dữ liệu từ server.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = projects.reduce(
      (sum, p) => sum + (p.tasks?.length || 0),
      0
    );
    const doneTasks = projects.reduce(
      (sum, p) =>
        sum + (p.tasks?.filter((t) => t.isDone).length || 0),
      0
    );
    const avgProgress =
      totalProjects === 0
        ? 0
        : Math.round(
            projects.reduce(
              (sum, p) => sum + (Number(p.progress) || 0),
              0
            ) / totalProjects
          );
    return { totalProjects, totalTasks, doneTasks, avgProgress };
  }, [projects]);

  const handleAdd = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa dự án này?')) return;
    const previous = projects;
    const next = projects.filter((p) => (p._id || p.id) !== id);
    setProjects(next);

    if (!isMongoId(id)) return;

    try {
      const response = await fetch(`/api/project-reports/item/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Xóa thất bại');
      setSaveMessage('Đã xóa dự án.');
      setMessageType('success');
    } catch (error) {
      console.error('Delete failed:', error);
      setProjects(previous);
      setSaveMessage(error.message || 'Không thể xóa trên server.');
      setMessageType('error');
    }
  };

  const handleSubmit = async (values) => {
    const editingId = values.id;
    const isEdit = isMongoId(editingId);
    const previous = projects;
    setModalOpen(false);
    setEditingProject(null);

    try {
      if (isEdit) {
        const response = await fetch(
          `/api/project-reports/item/${editingId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          }
        );
        if (!response.ok) throw new Error('Cập nhật thất bại');
        const result = await response.json();
        const newId = result.data?._id || editingId;
        setProjects((prev) =>
          prev.map((p) =>
            (p._id || p.id) === editingId
              ? { ...p, ...values, _id: newId, id: newId }
              : p
          )
        );
        setSaveMessage('Đã cập nhật dự án.');
        setMessageType('success');
      } else {
        const response = await fetch('/api/project-reports/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error('Tạo mới thất bại');
        const result = await response.json();
        const newId = result.data?._id;
        setProjects((prev) => [
          ...prev,
          { ...values, _id: newId, id: newId },
        ]);
        setSaveMessage('Đã thêm dự án.');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Save failed:', error);
      setProjects(previous);
      setSaveMessage(error.message || 'Không thể lưu trên server.');
      setMessageType('error');
    }
  };

  // Local edits for inline task/note updates before save-all
  const handleChangeProject = (projectId, patch) => {
    setProjects((prev) =>
      prev.map((p) =>
        (p._id || p.id) === projectId ? { ...p, ...patch } : p
      )
    );
    setSaveMessage('Có thay đổi chưa lưu. Nhấn "Lưu tất cả" để đồng bộ.');
    setMessageType('info');
  };

  const handleReset = async () => {
    setLoading(true);
    await fetchProjects();
    setSaveMessage('Đã tải lại dữ liệu từ server.');
    setMessageType('info');
  };

  const handleClear = () => {
    if (!window.confirm('Xóa trắng danh sách hiện tại (chưa lưu server)?'))
      return;
    setProjects([]);
    setSaveMessage('Đã xóa trắng (chưa lưu server).');
    setMessageType('info');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = {
        items: projects.map((p, idx) => ({
          stt: p.stt || idx + 1,
          title: p.title,
          description: p.description || '',
          status: p.status || 'Pending',
          progress: Number(p.progress) || 0,
          startDate: p.startDate || null,
          endDate: p.endDate || null,
          assignee: p.assignee || '',
          category: p.category || '',
          notes: p.notes || '',
          tasks: (p.tasks || []).map((t) => ({
            title: t.title,
            isDone: Boolean(t.isDone),
            dueDate: t.dueDate || null,
            assignee: t.assignee || '',
            note: t.note || '',
          })),
        })),
      };
      const response = await fetch('/api/project-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Lưu thất bại');
      }
      setSaveMessage('Đã lưu tất cả thay đổi lên server.');
      setMessageType('success');
      fetchProjects();
    } catch (error) {
      setSaveMessage(error.message || 'Có lỗi khi lưu.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const headers = [
      'STT',
      'Dự án',
      'Mô tả',
      'Trạng thái',
      'Tiến độ (%)',
      'Bắt đầu',
      'Kết thúc',
      'Phụ trách',
      'Phân loại',
      'Tổng task',
      'Task hoàn thành',
    ];
    const rows = projects.map((p, idx) => [
      p.stt || idx + 1,
      p.title || '',
      stripHtml(p.description || ''),
      STATUS_LABELS[p.status] || p.status || '',
      Number(p.progress) || 0,
      formatDate(p.startDate),
      formatDate(p.endDate),
      p.assignee || '',
      p.category || '',
      p.tasks?.length || 0,
      p.tasks?.filter((t) => t.isDone).length || 0,
    ]);
    const csv = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bao-cao-tien-do.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const messageColor =
    messageType === 'error'
      ? 'text-red-600'
      : messageType === 'success'
      ? 'text-green-600'
      : 'text-gray-600';

  return (
    <div className="min-h-screen bg-primary-50">
      <SEO
        title="Báo cáo tiến độ dự án"
        description="Theo dõi tiến độ, công việc, checklist và ghi chú cho các dự án của Tung Viet."
        keywords="project report, báo cáo tiến độ, todo, checklist, Tung Viet"
        url="/report"
      />

      <header className="border-b border-primary-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">
                Báo cáo tiến độ dự án
              </h1>
              <p className="text-sm text-gray-600">
                Theo dõi công việc, checklist, ngày thực hiện và ghi chú
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleAdd} className="btn btn-primary">
                <FiPlus className="mr-2" />
                Thêm dự án
              </button>
              <button onClick={handleExport} className="btn btn-secondary">
                <FiDownload className="mr-2" />
                Xuất CSV
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                <FiRefreshCw className="mr-2" />
                Tải lại
              </button>
              <button onClick={handleClear} className="btn btn-danger">
                <FiTrash2 className="mr-2" />
                Xóa trắng
              </button>
            </div>
          </div>
          {saveMessage && (
            <p className={`mt-2 text-xs ${messageColor}`}>{saveMessage}</p>
          )}
        </div>
      </header>

      {/* Banner */}
      {loading ? (
        <RFPHeaderSkeleton />
      ) : (
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-4">
              Tổng quan dự án Tung Viet
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="https://tungviet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 rounded-lg bg-white/10 p-4 hover:bg-white/20 transition-colors"
              >
                <span className="text-xs text-white/70">Website hiện tại</span>
                <span className="font-semibold">Tung Viet</span>
                <span className="text-xs text-white/80">tungviet.com</span>
              </a>
              <div className="flex flex-col gap-1 rounded-lg bg-white/10 p-4">
                <span className="text-xs text-white/70">Tổng dự án</span>
                <span className="font-semibold">{stats.totalProjects}</span>
                <span className="text-xs text-white/80">đang theo dõi</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/10 p-4">
                <span className="text-xs text-white/70">Tổng task</span>
                <span className="font-semibold">
                  {stats.doneTasks}/{stats.totalTasks}
                </span>
                <span className="text-xs text-white/80">đã hoàn thành</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/10 p-4">
                <span className="text-xs text-white/70">Tiến độ trung bình</span>
                <span className="font-semibold">{stats.avgProgress}%</span>
                <span className="text-xs text-white/80">toàn bộ dự án</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="card p-4">
          {loading ? (
            <TableSkeleton />
          ) : (
            <ProjectReportTable
              items={projects}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onChangeProject={handleChangeProject}
            />
          )}
        </div>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-sm text-gray-600">Tổng số dự án</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProjects}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600">Tổng task</p>
              <p className="text-2xl font-bold text-primary">
                {stats.totalTasks}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600">Tiến độ trung bình</p>
              <p className="text-2xl font-bold text-primary">
                {stats.avgProgress}%
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <p className="text-xs text-gray-500 mr-auto">
            Mọi người đều có thể thêm task, ghi chú. Nhấn "Lưu tất cả" để đồng
            bộ lên server.
          </p>
          <button
            onClick={handleSaveAll}
            className="btn btn-primary"
            disabled={saving || projects.length === 0}
          >
            <FiSave className="mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
      </main>

      <ProjectReportFormModal
        open={modalOpen}
        initialValues={editingProject}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ProjectReport;
