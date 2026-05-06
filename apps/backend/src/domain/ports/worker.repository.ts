import type { Worker } from "../models/worker.js";

export interface WorkerRepository {
  findAll(): Promise<Worker[]>;
  findById(id: string): Promise<Worker | null>;
  create(data: { name: string; isRegular: boolean }): Promise<Worker>;
  update(id: string, data: { name?: string; isRegular?: boolean }): Promise<Worker>;
  delete(id: string): Promise<void>;
  countRecords(workerId: string): Promise<number>;
}
