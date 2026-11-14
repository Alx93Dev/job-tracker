export class ApiError extends Error {
  constructor(
    readonly status: number,
    serverMessage: string | string[],
  ) {
    super(Array.isArray(serverMessage) ? serverMessage.join('. ') : serverMessage);
    this.name = 'ApiError';
  }
}
