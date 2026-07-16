import { leadershipService } from '../../services/leadership.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllLeadership = async (req, res, next) => {
  try {
    const members = await leadershipService.getAdmin();
    return apiResponse.ok(res, members);
  } catch (err) {
    next(err);
  }
};

export const getLeadershipById = async (req, res, next) => {
  try {
    const member = await leadershipService.getById(req.params.id);
    return apiResponse.ok(res, member);
  } catch (err) {
    next(err);
  }
};

export const createLeadership = async (req, res, next) => {
  try {
    if (!req.body.name?.vi?.trim()) {
      return apiResponse.badRequest(res, 'Ten (VI) la bat buoc');
    }
    const member = await leadershipService.create(req.body);
    return apiResponse.created(res, member, 'Them thanh vien thanh cong');
  } catch (err) {
    next(err);
  }
};

export const updateLeadership = async (req, res, next) => {
  try {
    const member = await leadershipService.update(req.params.id, req.body);
    return apiResponse.ok(res, member, 'Cap nhat thanh cong');
  } catch (err) {
    next(err);
  }
};

export const deleteLeadership = async (req, res, next) => {
  try {
    await leadershipService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xoa thanh vien thanh cong');
  } catch (err) {
    next(err);
  }
};

export const reorderLeadership = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return apiResponse.badRequest(res, 'order phai la mang id');
    }
    await leadershipService.reorder(order);
    const members = await leadershipService.getAdmin();
    return apiResponse.ok(res, members, 'Sap xep thanh cong');
  } catch (err) {
    next(err);
  }
};
