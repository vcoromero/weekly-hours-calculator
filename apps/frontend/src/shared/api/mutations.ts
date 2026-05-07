import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Worker, CreateRecordInput, Week } from "../types";

export function useCreateWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; isRegular: boolean }) =>
      api.post<Worker>("/workers", data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

export function useUpdateWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string; name?: string; isRegular?: boolean }) =>
      api.put<Worker>(`/workers/${id}`, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

export function useDeleteWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/workers/${id}`),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

export function useAddRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordInput & { weekId: string }) =>
      api.post<{ id: string; weekId: string; week?: { id: string; label: string; startDate: string; endDate: string; status: string } }>("/records", data),
    onSuccess: async (_result) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["weeks", "current"] }),
        qc.invalidateQueries({ queryKey: ["weeks"] }),
        qc.invalidateQueries({ queryKey: ["weeks", "available"] }),
        qc.invalidateQueries({ queryKey: ["records"] }),
        qc.invalidateQueries({ queryKey: ["workers"] }),
      ]);
    },
  });
}

export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/records/${id}`),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["weeks", "current"] }),
        qc.invalidateQueries({ queryKey: ["weeks"] }),
        qc.invalidateQueries({ queryKey: ["weeks", "available"] }),
        qc.invalidateQueries({ queryKey: ["records"] }),
        qc.invalidateQueries({ queryKey: ["workers"] }),
      ]);
    },
  });
}

export function useSaveWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { weekId: string; records: CreateRecordInput[] }) =>
      api.post<Week>("/weeks/save", data),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["weeks"] }),
        qc.invalidateQueries({ queryKey: ["weeks", "current"] }),
        qc.invalidateQueries({ queryKey: ["weeks", "available"] }),
        qc.invalidateQueries({ queryKey: ["records"] }),
        qc.invalidateQueries({ queryKey: ["workers"] }),
      ]);
    },
  });
}

export function useUpdateWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      records,
    }: {
      id: string;
      records: CreateRecordInput[];
    }) => api.put<Week>(`/weeks/${id}`, { records }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["weeks"] }),
        qc.invalidateQueries({ queryKey: ["weeks", variables.id] }),
        qc.invalidateQueries({ queryKey: ["weeks", "available"] }),
        qc.invalidateQueries({ queryKey: ["records"] }),
        qc.invalidateQueries({ queryKey: ["workers"] }),
      ]);
    },
  });
}

export function useDeleteWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/weeks/${id}`),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["weeks"] }),
        qc.invalidateQueries({ queryKey: ["weeks", "current"] }),
      ]);
    },
  });
}
