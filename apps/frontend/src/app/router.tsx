import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { ProtectedLayout } from "@/shared/components/Layout";

const LoginForm = lazy(() =>
  import("@/features/auth/components/LoginForm").then((m) => ({ default: m.LoginForm }))
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/components/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const WeekEntryPage = lazy(() =>
  import("@/features/week-entry/components/WeekEntryPage").then((m) => ({ default: m.WeekEntryPage }))
);
const WeekDetailPage = lazy(() =>
  import("@/features/week-entry/components/WeekDetailPage").then((m) => ({ default: m.WeekDetailPage }))
);
const WorkersPage = lazy(() =>
  import("@/features/workers/components/WorkersPage").then((m) => ({ default: m.WorkersPage }))
);
const WorkerDashboardPage = lazy(() =>
  import("@/features/workers/components/WorkerDashboardPage").then((m) => ({ default: m.WorkerDashboardPage }))
);
const WorkerWeekDetailPage = lazy(() =>
  import("@/features/week-entry/components/WorkerWeekDetailPage").then((m) => ({ default: m.WorkerWeekDetailPage }))
);

export function AppRouter() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
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
    </Suspense>
  );
}
