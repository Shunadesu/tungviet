import { locationService } from '../../services/location.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getAdmin();
    return apiResponse.ok(res, locations);
  } catch (err) {
    next(err);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await locationService.getById(req.params.id);
    return apiResponse.ok(res, location);
  } catch (err) {
    next(err);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    if (!req.body.name?.vi?.trim()) {
      return apiResponse.badRequest(res, 'Ten (VI) la bat buoc');
    }
    const location = await locationService.create(req.body);
    return apiResponse.created(res, location, 'Them dia diem thanh cong');
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const location = await locationService.update(req.params.id, req.body);
    return apiResponse.ok(res, location, 'Cap nhat dia diem thanh cong');
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    await locationService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xoa dia diem thanh cong');
  } catch (err) {
    next(err);
  }
};

export const reorderLocations = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return apiResponse.badRequest(res, 'order phai la mang id');
    }
    await locationService.reorder(order);
    const locations = await locationService.getAdmin();
    return apiResponse.ok(res, locations, 'Sap xep thanh cong');
  } catch (err) {
    next(err);
  }
};
