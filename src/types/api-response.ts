export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;
  errors?: any;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}