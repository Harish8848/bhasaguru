export interface PaginationParams {
    page: number;
    limit: number;
    skip?: number;
    take?: number;
  }
  
  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export interface ApiSuccessResponse<T> {
    success: true;
    message?: string;
    data: T;
    pagination?: PaginationMeta;
  }
  
  export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: any;
  }
  
  export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;