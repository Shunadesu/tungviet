import ProjectReport from '../models/ProjectReport.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_STATUS = ['Pending', 'InProgress', 'Done', 'Blocked'];

const toTask = (task) => ({
  title: (task?.title || '').toString().trim(),
  isDone: Boolean(task?.isDone),
  dueDate: task?.dueDate ? new Date(task.dueDate) : null,
  assignee: (task?.assignee || '').toString().trim(),
  note: task?.note || '',
});

const toDoc = (item) => ({
  stt: Number(item.stt) || 0,
  title: (item.title || '').toString().trim(),
  description: item.description || '',
  status: ALLOWED_STATUS.includes(item.status) ? item.status : 'Pending',
  progress: Math.min(100, Math.max(0, Number(item.progress) || 0)),
  startDate: item.startDate ? new Date(item.startDate) : null,
  endDate: item.endDate ? new Date(item.endDate) : null,
  assignee: (item.assignee || '').toString().trim(),
  category: (item.category || '').toString().trim(),
  notes: item.notes || '',
  tasks: Array.isArray(item.tasks) ? item.tasks.map(toTask) : [],
});

export const projectReportService = {
  async listAll() {
    return ProjectReport.find().sort({ stt: 1 });
  },

  async getById(id) {
    const doc = await ProjectReport.findById(id);
    if (!doc) throw AppError.notFound('ProjectReport not found');
    return doc;
  },

  async saveBatch(items) {
    if (!Array.isArray(items)) {
      throw AppError.badRequest('Invalid project report payload');
    }
    const documents = items.map(toDoc);
    await ProjectReport.deleteMany({});
    return ProjectReport.insertMany(documents);
  },

  async create(item) {
    return ProjectReport.create(toDoc(item));
  },

  async update(id, item) {
    const doc = await ProjectReport.findByIdAndUpdate(id, toDoc(item), {
      new: true,
      runValidators: true,
    });
    if (!doc) throw AppError.notFound('ProjectReport not found');
    return doc;
  },

  async delete(id) {
    const doc = await ProjectReport.findByIdAndDelete(id);
    if (!doc) throw AppError.notFound('ProjectReport not found');
    return doc;
  },
};
