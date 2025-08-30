export function parseSortString(sort: string, defaultField = 'id') {
  let orderKey = defaultField;
  let orderBy: 'ASC' | 'DESC' = 'DESC';

  if (sort) {
    if (sort.startsWith('-')) {
      orderKey = sort.substring(1);
      orderBy = 'DESC';
    } else {
      orderKey = sort;
      orderBy = 'ASC';
    }
  }

  return { orderKey, orderBy };
}
