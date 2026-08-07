import { postService } from '../../services/post.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getPublicPosts = async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const result = await postService.getPublic({ page: +page || 1, limit: +limit || 9, category });
    return apiResponse.ok(res, result);
  } catch (err) { next(err); }
};

export const getPublicPost = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await postService.getPublicBySlug(slug);
    if (!post) return apiResponse.notFound(res, 'Khong tim thay bai viet');
    const relatedCategoryId = post.category?._id || post.category || null;
    const related = await postService.getRelated(post._id, relatedCategoryId, 3);
    return apiResponse.ok(res, { ...post, related });
  } catch (err) { next(err); }
};
