import { Request, Response, NextFunction } from "express";
import type { RecordApplicationService } from "../../../application/records/records.service.js";

export function createRecordsController(recordService: RecordApplicationService) {
  return {
    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const record = await recordService.create(req.body);
        res.status(201).json(record);
      } catch (err) {
        next(err);
      }
    },

    async getByWeek(req: Request, res: Response, next: NextFunction) {
      try {
        const records = await recordService.findByWeek(req.params.weekId);
        res.json(records);
      } catch (err) {
        next(err);
      }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
      try {
        await recordService.delete(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}
