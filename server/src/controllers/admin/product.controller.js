import { productService } from '../../services/product.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { uploadSinglePDF } from '../../middlewares/upload.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const { items, pagination } = await productService.listAdmin({ search, status, page, limit });
    return apiResponse.paginated(res, items, pagination);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id, { populate: false });
    return apiResponse.ok(res, product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    return apiResponse.created(res, product, 'Tạo sản phẩm thành công');
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    return apiResponse.ok(res, product, 'Cập nhật sản phẩm thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xóa sản phẩm thành công');
  } catch (err) {
    next(err);
  }
};

export const restoreProduct = async (req, res, next) => {
  try {
    const product = await productService.restore(req.params.id);
    return apiResponse.ok(res, product, 'Khôi phục sản phẩm thành công');
  } catch (err) {
    next(err);
  }
};

export const uploadTDS = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      return apiResponse.badRequest(res, 'Vui lòng upload file TDS (PDF)');
    }
    const tdsUrl = `/uploads/${file.filename}`;
    const product = await productService.updateTdsUrl(req.params.id, tdsUrl);
    return apiResponse.ok(res, { tdsUrl, product }, 'Upload TDS thành công');
  } catch (err) {
    next(err);
  }
};

export const listProductsForSelect = async (req, res, next) => {
  try {
    const products = await productService.listForSelect();
    return apiResponse.ok(res, products);
  } catch (err) {
    next(err);
  }
};

export const batchDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return apiResponse.badRequest(res, 'Danh sách id không hợp lệ');
    }
    const result = await productService.batchDelete(ids);
    return apiResponse.ok(res, result, `Đã xóa ${result.deletedCount} sản phẩm`);
  } catch (err) {
    next(err);
  }
};
