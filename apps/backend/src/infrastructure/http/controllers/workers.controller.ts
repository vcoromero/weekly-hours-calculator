import { Request, Response, NextFunction } from "express";
import type { CreateWorkerUseCase } from "../../../application/use-cases/workers/create-worker.use-case.js";
import type { GetWorkerByIdUseCase } from "../../../application/use-cases/workers/get-worker-by-id.use-case.js";
import type { ListWorkersUseCase } from "../../../application/use-cases/workers/list-workers.use-case.js";
import type { UpdateWorkerUseCase } from "../../../application/use-cases/workers/update-worker.use-case.js";
import type { DeleteWorkerUseCase } from "../../../application/use-cases/workers/delete-worker.use-case.js";
import type { GetWorkerHistoryUseCase } from "../../../application/use-cases/workers/get-worker-history.use-case.js";
import type { GetWorkerStatsUseCase } from "../../../application/use-cases/workers/get-worker-stats.use-case.js";
import type { GetWorkerDashboardUseCase } from "../../../application/use-cases/workers/get-worker-dashboard.use-case.js";

interface WorkersControllerDeps {
  createWorker: CreateWorkerUseCase;
  getWorkerById: GetWorkerByIdUseCase;
  listWorkers: ListWorkersUseCase;
  updateWorker: UpdateWorkerUseCase;
  deleteWorker: DeleteWorkerUseCase;
  getWorkerHistory: GetWorkerHistoryUseCase;
  getWorkerStats: GetWorkerStatsUseCase;
  getWorkerDashboard: GetWorkerDashboardUseCase;
}

export function createWorkersController(deps: WorkersControllerDeps) {
  return {
    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 10));
        const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
        const isRegularParam = req.query.isRegular;
        const isRegular = isRegularParam === "true" ? true : isRegularParam === "false" ? false : undefined;
        const result = await deps.listWorkers.execute({ page, pageSize, search, isRegular });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
      try {
        const worker = await deps.getWorkerById.execute(req.params.id as string);
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
        const worker = await deps.createWorker.execute(req.body);
        res.status(201).json(worker);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        const worker = await deps.updateWorker.execute(req.params.id as string, req.body);
        res.json(worker);
      } catch (err) {
        next(err);
      }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
      try {
        await deps.deleteWorker.execute(req.params.id as string);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },

    async history(req: Request, res: Response, next: NextFunction) {
      try {
        const history = await deps.getWorkerHistory.execute(req.params.id as string);
        res.json(history);
      } catch (err) {
        next(err);
      }
    },

    async stats(req: Request, res: Response, next: NextFunction) {
      try {
        const stats = await deps.getWorkerStats.execute(req.params.id as string);
        res.json(stats);
      } catch (err) {
        next(err);
      }
    },

    async dashboard(req: Request, res: Response, next: NextFunction) {
      try {
        const dashboard = await deps.getWorkerDashboard.execute(req.params.id as string);
        res.json(dashboard);
      } catch (err) {
        next(err);
      }
    },
  };
}
