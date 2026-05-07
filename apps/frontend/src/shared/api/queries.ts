import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type {
  WeekSummary,
  Worker,
  Week,
  WorkerHistoryItem,
  WorkerStats,
  WorkerDashboard,
} from "../types";

export function useWorkers() {
  return useQuery({
    queryKey: ["workers"],
    queryFn: () => api.get<Worker[]>("/workers"),
    staleTime: 30_000,
  });
}

export function useWeeks() {
  return useQuery({
    queryKey: ["weeks"],
    queryFn: () => api.get<WeekSummary[]>("/weeks"),
    staleTime: 30_000,
  });
}

export function useAvailableWeeks() {
  return useQuery({
    queryKey: ["weeks", "available"],
    queryFn: () => api.get<Week[]>("/weeks/available"),
    staleTime: 30_000,
  });
}

export function useCurrentWeek() {
  return useQuery({
    queryKey: ["weeks", "current"],
    queryFn: () => api.get<Week>("/weeks/current"),
    staleTime: 10_000,
  });
}

export function useWeekRecords(weekId: string) {
  return useQuery({
    queryKey: ["records", weekId],
    queryFn: () =>
      api.get<Array<{
        id: string;
        workerId: string;
        workerName: string;
        date: string;
        hours: number;
        hourlyRate: number;
        total: number;
        description: string | null;
      }>>(`/records/week/${weekId}`),
    enabled: !!weekId,
    staleTime: 10_000,
  });
}

export function useWorkerHistory(workerId: string) {
  return useQuery({
    queryKey: ["workers", workerId, "history"],
    queryFn: () => api.get<WorkerHistoryItem[]>(`/workers/${workerId}/history`),
    enabled: !!workerId,
  });
}

export function useWorkerStats(workerId: string) {
  return useQuery({
    queryKey: ["workers", workerId, "stats"],
    queryFn: () => api.get<WorkerStats>(`/workers/${workerId}/stats`),
    enabled: !!workerId,
  });
}

export function useWorkerDashboard(workerId: string) {
  return useQuery({
    queryKey: ["workers", workerId, "dashboard"],
    queryFn: () => api.get<WorkerDashboard>(`/workers/${workerId}/dashboard`),
    enabled: !!workerId,
  });
}

export function useWorkerWeek(workerId: string, weekId: string) {
  return useQuery({
    queryKey: ["workers", workerId, "weeks", weekId],
    queryFn: () => api.get<Week>(`/workers/${workerId}/weeks/${weekId}`),
    enabled: !!workerId && !!weekId,
    staleTime: 30_000,
  });
}

export function useWeekById(weekId: string) {
  return useQuery({
    queryKey: ["weeks", weekId],
    queryFn: () => api.get<Week>(`/weeks/${weekId}`),
    enabled: !!weekId,
    staleTime: 30_000,
  });
}
