import { postService } from '../../services/post.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';

const sortPosts = (items) =>
  (items || []).slice().sort((a, b) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    if (ao !== bo) return ao - bo;
    const ad = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const bd = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return bd - ad;
  });

export const getPublicPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, category } = req.query;
    const cacheKey = cacheKeys.publicPosts({ page, limit, category });
    let result = cacheStore.get(cacheKey);
    if (!result) {
      result = await postService.getPublic({
        page: +page || 1,
        limit: +limit || 9,
        category,
      });
      cacheStore.set(cacheKey, result, TTL.PUBLIC_POSTS);
    }
    const items = sortPosts(result.items || []);
    return apiResponse.ok(res, { ...result, items });
  } catch (err) {
    next(err);
  }
};

export const getPublicPost = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await postService.getPublicBySlug(slug);
    if (!post) return apiResponse.notFound(res, 'Khong tim thay bai viet');
    const relatedCategoryId = post.category?._id || post.category || null;
    const related = await postService.getRelated(post._id, relatedCategoryId, 3);
    return apiResponse.ok(res, { ...post, related });
  } catch (err) {
    next(err);
  }
};
