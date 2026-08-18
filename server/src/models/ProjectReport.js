import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignee: {
      type: String,
      default: '',
      trim: true,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const projectReportSchema = new mongoose.Schema(
  {
    stt: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'InProgress', 'Done', 'Blocked'],
      default: 'Pending',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    assignee: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    tasks: {
      type: [taskSchema],
      default: [],
    },
  },
  { timestamps: true }
);

projectReportSchema.index({ stt: 1 }, { unique: true });

const ProjectReport = mongoose.model('ProjectReport', projectReportSchema);

export default ProjectReport;
