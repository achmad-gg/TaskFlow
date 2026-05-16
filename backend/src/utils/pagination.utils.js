// Pagination must be server-side. Client-side pagination on large datasets
// is a performance anti-pattern — you'd be sending 10,000 rows to show 10.

export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Cap at 100
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};