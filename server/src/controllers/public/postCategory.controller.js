import { postCategoryService } from '../../services/postCategory.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getPublicPostCategories = async (req, res, next) => {
  try {
    const items = await postCategoryService.getPublic();
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};
