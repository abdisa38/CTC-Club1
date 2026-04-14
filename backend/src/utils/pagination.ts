import { Request } from 'express';

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
};

export const getPagination = (
  req: Pick<Request, 'query'>,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): Pagination => {
  const basePage = defaults.page ?? 1;
  const baseLimit = defaults.limit ?? 20;
  const maxLimit = defaults.maxLimit ?? 100;

  const rawPage = Number(req.query?.page);
  const rawLimit = Number(req.query?.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : basePage;
  const requestedLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : baseLimit;
  const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);

  return {
    page,
    limit,
    skip: limit * (page - 1),
  };
};
