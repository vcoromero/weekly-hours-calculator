export interface WorkerPayment {
  id: string;
  workerId: string;
  weekId: string;
  totalAmount: number;
  paidAt: Date;
}