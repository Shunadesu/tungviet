import { estimateService } from '../services/estimate.service.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getEstimates = async (req, res, next) => {
  try {
    const items = await estimateService.listAll();
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};

export const saveEstimateBatch = async (req, res, next) => {
  try {
    const saved = await estimateService.saveBatch(req.body.items);
    return apiResponse.created(res, saved, 'Estimate saved successfully');
  } catch (err) {
    next(err);
  }
};

export const createEstimate = async (req, res, next) => {
  try {
    const doc = await estimateService.create(req.body);
    return apiResponse.created(res, doc, 'Estimate created successfully');
  } catch (err) {
    next(err);
  }
};

export const updateEstimate = async (req, res, next) => {
  try {
    const doc = await estimateService.update(req.params.id, req.body);
    return apiResponse.ok(res, doc, 'Estimate updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteEstimate = async (req, res, next) => {
  try {
    const doc = await estimateService.delete(req.params.id);
    return apiResponse.ok(res, doc, 'Estimate deleted successfully');
  } catch (err) {
    next(err);
  }
};