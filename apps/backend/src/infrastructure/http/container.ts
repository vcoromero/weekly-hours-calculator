import { prisma } from "../persistence/prisma/prisma-client.js";
import { JwtBcryptAuthAdapter } from "../auth/jwt-bcrypt.adapter.js";
import { AuthApplicationService } from "../../application/auth/auth.service.js";

import { WorkerPrismaRepository } from "../persistence/prisma/worker.prisma-repository.js";
import { RecordPrismaRepository } from "../persistence/prisma/record.prisma-repository.js";
import { WeekPrismaRepository } from "../persistence/prisma/week.prisma-repository.js";

import { WeekCalculator } from "../../domain/services/week-calculator.js";
import { TotalsCalculator } from "../../domain/services/totals-calculator.js";

import { WorkerApplicationService } from "../../application/workers/workers.service.js";
import { RecordApplicationService } from "../../application/records/records.service.js";
import { WeekApplicationService } from "../../application/weeks/weeks.service.js";

import { createAuthController } from "./controllers/auth.controller.js";
import { createWorkersController } from "./controllers/workers.controller.js";
import { createRecordsController } from "./controllers/records.controller.js";
import { createWeeksController } from "./controllers/weeks.controller.js";
import { createAuthMiddleware } from "./middleware/auth.middleware.js";

const authAdapter = new JwtBcryptAuthAdapter();

const workerRepo = new WorkerPrismaRepository(prisma);
const recordRepo = new RecordPrismaRepository(prisma);
const weekRepo = new WeekPrismaRepository(prisma);

const weekCalc = new WeekCalculator();
const totalsCalc = new TotalsCalculator();

const authService = new AuthApplicationService(authAdapter);
const workerService = new WorkerApplicationService(workerRepo, recordRepo, weekRepo, totalsCalc, weekCalc);
const recordService = new RecordApplicationService(recordRepo, weekRepo, totalsCalc, weekCalc);
const weekService = new WeekApplicationService(weekRepo, recordRepo, workerRepo, weekCalc, totalsCalc);

export const authController = createAuthController(authService);
export const workersController = createWorkersController(workerService);
export const recordsController = createRecordsController(recordService);
export const weeksController = createWeeksController(weekService);

export const requireAuth = createAuthMiddleware(authService);
