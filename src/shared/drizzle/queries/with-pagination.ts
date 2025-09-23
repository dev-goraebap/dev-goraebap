import { PgSelect } from "drizzle-orm/pg-core";

export async function withPagination<T extends PgSelect>(
  dataQuery: T,
  countQuery: PgSelect,
  page = 1,
  perPage = 5,
) {
  const query = dataQuery
    .limit(perPage)
    .offset((page - 1) * perPage);

  const [data, countResult] = await Promise.all([
    query,
    countQuery
  ]);

  return {
    data,
    meta: {
      total: countResult[0].count,
      page,
      perPage: perPage,
      totalPages: Math.ceil(countResult[0].count / perPage)
    }
  };
}