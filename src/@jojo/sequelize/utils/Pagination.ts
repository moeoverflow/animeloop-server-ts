export interface IPagination {
  count: number,
  limit: number,
  offset: number,
}

export interface IPaginationResult<T> extends IPagination {
  rows: T[]
}