import type { Request, Response, NextFunction } from "express";
import type { PayWorkerUseCase } from "../../../application/use-cases/payments/pay-worker.use-case.js";

interface PaymentControllerDeps {
  payWorker: PayWorkerUseCase;
}

export function createPaymentController(deps: PaymentControllerDeps) {
  return {
    async pay(req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id as string;
        const { weekIds } = req.body;

        const result = await deps.payWorker.execute(id, { weekIds });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
