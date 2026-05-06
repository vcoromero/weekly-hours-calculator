import { Request, Response, NextFunction } from "express";
import type { WorkerApplicationService } from "../../../application/workers/workers.service.js";

export function createWorkersController(workerService: WorkerApplicationService) {
  return {
    async list(_req: Request, res: Response, next: NextFunction) {
      try {
        const workers = await workerService.list();
        res.json(workers);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
      try {
        const worker = await workerService.getById(req.params.id);
        if (!worker) {
          res.status(404).json({ error: "Worker not found" });
          return;
        }
        res.json(worker);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const worker = await workerService.create(req.body);
        res.status(201).json(worker);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        const worker = await workerService.update(req.params.id, req.body);
        res.json(worker);
      } catch (err) {
        next(err);
      }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
      try {
        await workerService.delete(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },

    async history(req: Request, res: Response, next: NextFunction) {
      try {
        const history = await workerService.getHistory(req.params.id);
        res.json(history);
      } catch (err) {
        next(err);
      }
    },

    async stats(req: Request, res: Response, next: NextFunction) {
      try {
        const stats = await workerService.getStats(req.params.id);
        res.json(stats);
      } catch (err) {
        next(err);
      }
    },

    async dashboard(req: Request, res: Response, next: NextFunction) {
      try {
        const dashboard = await workerService.getDashboard(req.params.id);
        res.json(dashboard);
      } catch (err) {
        next(err);
      }
    },
  };
}
