import { postService } from '../../services/post.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { invalidatePublicCache } from '../../utils/cache.js';

export const getAllPosts = async (req, res, next) => {
  try {
    const result = await postService.getAdmin(req.query);
    return apiResponse.ok(res, result);
  } catch (err) { next(err); }
};

export const getPost = async (req, res, next) => {
  try {
    const doc = await postService.getAdmin({ ...req.query, _id: req.params.id });
    return apiResponse.ok(res, doc.items?.[0] || null);
  } catch (err) { next(err); }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, thumbnail, images, category, facebookUrl, seoTitle, seoDescription, seoKeywords, isActive, publishedAt } = req.body;
    if (!title?.trim()) return apiResponse.badRequest(res, 'Tieu de la bat buoc');
    const doc = await postService.create({ title, excerpt, content, thumbnail, images, category, facebookUrl, seoTitle, seoDescription, seoKeywords, isActive, publishedAt });
    return apiResponse.created(res, doc, 'Tao thanh cong');
  } catch (err) { next(err); }
};

export const updatePost = async (req, res, next) => {
  try {
    const doc = await postService.update(req.params.id, req.body);
    if (!doc) return apiResponse.notFound(res, 'Khong tim thay');
    return apiResponse.ok(res, doc, 'Cap nhat thanh cong');
  } catch (err) { next(err); }
};

export const deletePost = async (req, res, next) => {
  try {
    await postService.remove(req.params.id);
    return apiResponse.ok(res, null, 'Xoa thanh cong');
  } catch (err) { next(err); }
};

export const reorderPosts = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return apiResponse.badRequest(res, 'Danh sach khong hop le');
    await postService.reorder(order);
    return apiResponse.ok(res, null, 'Sap xep thanh cong');
  } catch (err) { next(err); }
};
