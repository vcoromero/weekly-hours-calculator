import { useNavigate } from "react-router";
import { useWeeks } from "@/shared/api/queries";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { WeekCard } from "./WeekCard";
import { Plus } from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: weeks, isLoading, error } = useWeeks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Tus semanas de trabajo guardadas
          </p>
        </div>
        <Button onClick={() => navigate("/week-entry")}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva semana
        </Button>
      </div>

      {isLoading && (
        <Spinner />
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar las semanas. Intenta de nuevo.
        </div>
      )}

      {weeks && weeks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">Sin semanas guardadas</p>
          <p className="text-sm mt-1">
            Haz click en "Nueva semana" para registrar horas
          </p>
        </div>
      )}

      {weeks && weeks.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week) => (
            <WeekCard key={week.id} week={week} />
          ))}
        </div>
      )}
    </div>
  );
}
