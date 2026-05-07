import { Routes, Route, Navigate } from "react-router";
import { ProtectedLayout } from "@/shared/components/Layout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { WeekEntryPage } from "@/features/week-entry/components/WeekEntryPage";
import { WeekDetailPage } from "@/features/week-entry/components/WeekDetailPage";
import { WorkersPage } from "@/features/workers/components/WorkersPage";
import { WorkerDashboardPage } from "@/features/workers/components/WorkerDashboardPage";
import { WorkerWeekDetailPage } from "@/features/week-entry/components/WorkerWeekDetailPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/week-entry" element={<WeekEntryPage />} />
        <Route path="/weeks/:id" element={<WeekDetailPage />} />
        <Route path="/weeks/:id/edit" element={<WeekEntryPage />} />
        <Route path="/workers" element={<WorkersPage />} />
        <Route path="/workers/:id/dashboard" element={<WorkerDashboardPage />} />
        <Route path="/workers/:id/weeks/:weekId" element={<WorkerWeekDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
