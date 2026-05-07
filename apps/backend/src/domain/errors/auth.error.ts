export class AuthError extends Error {
  statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
