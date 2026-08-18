import { projectReportService } from '../services/projectReport.service.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getProjectReports = async (req, res, next) => {
  try {
    const items = await projectReportService.listAll();
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};

export const saveProjectReportBatch = async (req, res, next) => {
  try {
    const saved = await projectReportService.saveBatch(req.body.items);
    return apiResponse.created(res, saved, 'Project reports saved successfully');
  } catch (err) {
    next(err);
  }
};

export const createProjectReport = async (req, res, next) => {
  try {
    const doc = await projectReportService.create(req.body);
    return apiResponse.created(res, doc, 'Project report created successfully');
  } catch (err) {
    next(err);
  }
};

export const updateProjectReport = async (req, res, next) => {
  try {
    const doc = await projectReportService.update(req.params.id, req.body);
    return apiResponse.ok(res, doc, 'Project report updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteProjectReport = async (req, res, next) => {
  try {
    const doc = await projectReportService.delete(req.params.id);
    return apiResponse.ok(res, doc, 'Project report deleted successfully');
  } catch (err) {
    next(err);
  }
};
