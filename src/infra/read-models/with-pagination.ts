export type PaginationOptions = {
  total: number;
  page: number;
  perPage: number;
}

export class PaginationModel<T> {
  items: Partial<T>[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    perPage: number;
  }

  static with<T>(items: T[], options: PaginationOptions) {
    const total = options?.total ?? 0;
    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 5;
    return {
      items,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage)
      }
    };
  }
}