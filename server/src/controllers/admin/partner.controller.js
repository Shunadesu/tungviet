import { partnerService } from '../../services/partner.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { invalidatePublicCache } from '../../utils/cache.js';

export const getAllPartners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const items = await partnerService.getAdmin(type);
    return apiResponse.ok(res, items);
  } catch (err) { next(err); }
};

export const createPartner = async (req, res, next) => {
  try {
    const { name, logo, website, type } = req.body;
    if (!name?.trim()) return apiResponse.badRequest(res, 'Ten la bat buoc');
    const doc = await partnerService.create({ name, logo, website, type });
    return apiResponse.created(res, doc, 'Tao thanh cong');
  } catch (err) { next(err); }
};

export const updatePartner = async (req, res, next) => {
  try {
    const doc = await partnerService.update(req.params.id, req.body);
    if (!doc) return apiResponse.notFound(res, 'Khong tim thay');
    invalidatePublicCache();
    return apiResponse.ok(res, doc, 'Cap nhat thanh cong');
  } catch (err) { next(err); }
};

export const deletePartner = async (req, res, next) => {
  try {
    await partnerService.remove(req.params.id);
    invalidatePublicCache();
    return apiResponse.ok(res, null, 'Xoa thanh cong');
  } catch (err) { next(err); }
};

export const reorderPartners = async (req, res, next) => {
  try {
    const { order: orderList } = req.body;
    if (!Array.isArray(orderList)) return apiResponse.badRequest(res, 'Danh sach khong hop le');
    await partnerService.reorder(orderList);
    return apiResponse.ok(res, null, 'Sap xep thanh cong');
  } catch (err) { next(err); }
};
