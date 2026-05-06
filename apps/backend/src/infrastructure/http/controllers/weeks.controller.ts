import { Request, Response, NextFunction } from "express";
import type { WeekApplicationService } from "../../../application/weeks/weeks.service.js";

export function createWeeksController(weekService: WeekApplicationService) {
  return {
    async list(_req: Request, res: Response, next: NextFunction) {
      try {
        const weeks = await weekService.listWeeks();
        res.json(weeks);
      } catch (err) {
        next(err);
      }
    },

    async available(_req: Request, res: Response, next: NextFunction) {
      try {
        const weeks = await weekService.listAllWeeks();
        res.json(weeks);
      } catch (err) {
        next(err);
      }
    },

    async current(_req: Request, res: Response, next: NextFunction) {
      try {
        const week = await weekService.getCurrentWeek();
        res.json(week);
      } catch (err) {
        next(err);
      }
    },

    async preview(req: Request, res: Response, next: NextFunction) {
      try {
        const { weekId, records } = req.body;
        const preview = await weekService.previewWeek(weekId, records);
        res.json(preview);
      } catch (err) {
        next(err);
      }
    },

    async save(req: Request, res: Response, next: NextFunction) {
      try {
        const { weekId, records } = req.body;
        const result = await weekService.saveWeek(weekId, records);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
      try {
        const week = await weekService.getWeekDetail(req.params.id);
        res.json(week);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        const { records } = req.body;
        const result = await weekService.updateWeek(req.params.id, records);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
      try {
        await weekService.deleteWeek(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}
