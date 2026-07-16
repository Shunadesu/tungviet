export const apiResponse = {
  ok(res, data, message) {
    const body = { success: true, data };
    if (message) body.message = message;
    return res.status(200).json(body);
  },

  created(res, data, message = 'Tạo thành công') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  noContent(res) {
    return res.status(204).send();
  },

  paginated(res, items, pagination, message) {
    const body = {
      success: true,
      data: items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit) || 0,
      },
    };
    if (message) body.message = message;
    return res.status(200).json(body);
  },
};

export const buildPagination = (page = 1, limit = 20, total = 0) => ({
  page: parseInt(page, 10),
  limit: parseInt(limit, 10),
  total,
});