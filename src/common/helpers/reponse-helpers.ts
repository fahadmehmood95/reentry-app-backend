import { ApiResponse } from '../responses/api-response';

export class ResponseHelper {
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data ?? null, null);
  }

  static failure(message: string, errors?: string[]): ApiResponse<null> {
    return new ApiResponse(false, message, null, errors ?? []);
  }
}
