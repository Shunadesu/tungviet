import { memberService } from '../../services/member.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllMembers = async (req, res, next) => {
  try {
    const members = await memberService.getAdmin();
    return apiResponse.ok(res, members);
  } catch (err) {
    next(err);
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getById(req.params.id);
    return apiResponse.ok(res, member);
  } catch (err) {
    next(err);
  }
};

export const createMember = async (req, res, next) => {
  try {
    if (!req.body.name?.vi?.trim()) {
      return apiResponse.badRequest(res, 'Tên (VI) là bắt buộc');
    }
    const member = await memberService.create(req.body);
    return apiResponse.created(res, member, 'Thêm thành viên thành công');
  } catch (err) {
    next(err);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.update(req.params.id, req.body);
    return apiResponse.ok(res, member, 'Cập nhật thành viên thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    await memberService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xoá thành viên thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderMembers = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return apiResponse.badRequest(res, 'order phải là mảng id');
    }
    await memberService.reorder(order);
    const members = await memberService.getAdmin();
    return apiResponse.ok(res, members, 'Sắp xếp thành công');
  } catch (err) {
    next(err);
  }
};
