export type SuccessResponse<T> = {
  success: true;
  code: number;
  message: string | string[];
  data: T;
  url?: string;
};

export type ErrorResponse = {
  success: false;
  code: number;
  message: string | string[];
  url?: string;
};

// Union type yang akan digunakan di seluruh aplikasi
export type ResponseAction<T> = SuccessResponse<T> | ErrorResponse;
