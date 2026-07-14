const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const parseSorting = (query, allowedFields = ['createdAt']) => {
  const sortField = allowedFields.includes(query.sort) ? query.sort : 'createdAt';
  const sortOrder = query.order === 'asc' ? 'asc' : 'desc';
  return { [sortField]: sortOrder };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  },
});

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

module.exports = { parsePagination, parseSorting, paginatedResponse, AppError };
