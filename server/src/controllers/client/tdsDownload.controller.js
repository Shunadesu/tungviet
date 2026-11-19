import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import TdsDownload from '../../models/TdsDownload.js';
import { apiResponse } from '../../utils/apiResponse.js';

// Ghi nhận một lượt tải TDS của user đã đăng nhập, trả về đường dẫn file.
export const recordTdsDownload = async (req, res, next) => {
  try {
    const { productId } = req.body || {};
    if (!mongoose.isValidObjectId(productId)) {
      return apiResponse.badRequest(res, 'productId không hợp lệ');
    }

    const product = await Product.findOne({ _id: productId, webStatus: 'published' })
      .select('_id tdsUrl')
      .lean();
    if (!product) return apiResponse.notFound(res, 'Không tìm thấy sản phẩm');
    if (!product.tdsUrl) return apiResponse.notFound(res, 'Sản phẩm chưa có TDS');

    await TdsDownload.create({
      userId: req.user._id,
      productId: product._id,
      tdsUrl: product.tdsUrl,
    });

    return apiResponse.created(res, { tdsUrl: product.tdsUrl }, 'Đã ghi nhận lượt tải TDS');
  } catch (err) {
    next(err);
  }
};
