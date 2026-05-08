-- CreateTable
CREATE TABLE "WorkerPayment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkerPayment_workerId_idx" ON "WorkerPayment"("workerId");

-- CreateIndex
CREATE INDEX "WorkerPayment_weekId_idx" ON "WorkerPayment"("weekId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerPayment_workerId_weekId_key" ON "WorkerPayment"("workerId", "weekId");

-- AddForeignKey
ALTER TABLE "WorkerPayment" ADD CONSTRAINT "WorkerPayment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerPayment" ADD CONSTRAINT "WorkerPayment_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
