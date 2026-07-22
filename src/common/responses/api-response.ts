export class ApiResponse<T> {
  success!: boolean;
  message!: string;
  data!: T | null;
  errors!: string[] | null;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    errors: string[] | null = null,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}
