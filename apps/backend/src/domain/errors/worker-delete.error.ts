export class WorkerDeleteError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "WorkerDeleteError";
  }
}
