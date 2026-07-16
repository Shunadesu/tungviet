import { marketService } from '../../services/market.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllMarkets = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const { items, pagination } = await marketService.listAdmin({ search, status, page, limit });
    return apiResponse.paginated(res, items, pagination);
  } catch (err) {
    next(err);
  }
};

export const getMarketById = async (req, res, next) => {
  try {
    const market = await marketService.getById(req.params.id, { populate: true });
    return apiResponse.ok(res, market);
  } catch (err) {
    next(err);
  }
};

export const createMarket = async (req, res, next) => {
  try {
    const market = await marketService.create(req.body);
    return apiResponse.created(res, market, 'Tạo thị trường thành công');
  } catch (err) {
    next(err);
  }
};

export const updateMarket = async (req, res, next) => {
  try {
    const market = await marketService.update(req.params.id, req.body);
    return apiResponse.ok(res, market, 'Cập nhật thị trường thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteMarket = async (req, res, next) => {
  try {
    await marketService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xóa thị trường thành công');
  } catch (err) {
    next(err);
  }
};

export const restoreMarket = async (req, res, next) => {
  try {
    const market = await marketService.restore(req.params.id);
    return apiResponse.ok(res, market, 'Khôi phục thị trường thành công');
  } catch (err) {
    next(err);
  }
};

export const addProductsToMarket = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return apiResponse.badRequest(res, 'productIds phải là một mảng');
    }
    const market = await marketService.addProducts(req.params.id, productIds);
    return apiResponse.ok(res, market, 'Thêm sản phẩm vào thị trường thành công');
  } catch (err) {
    next(err);
  }
};

export const removeProductsFromMarket = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return apiResponse.badRequest(res, 'productIds phải là một mảng');
    }
    const market = await marketService.removeProducts(req.params.id, productIds);
    return apiResponse.ok(res, market, 'Xóa sản phẩm khỏi thị trường thành công');
  } catch (err) {
    next(err);
  }
};
