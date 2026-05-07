export class RecordError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "RecordError";
  }
}
