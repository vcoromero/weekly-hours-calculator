import { useParams, useNavigate, Link } from "react-router";
import { useWorkerDashboard, useWorkers } from "@/shared/api/queries";
import { Spinner } from "@/shared/components/ui/spinner";
import { formatCurrency } from "@/shared/utils/formatters";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, Hash, Clock } from "lucide-react";

export function WorkerDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useWorkerDashboard(id || "");
  const { data: workers } = useWorkers();

  const worker = workers?.find((w) => w.id === id);

  if (isLoading) return <Spinner />;

  if (!dashboard || !worker) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Trabajador no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/workers")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
      </div>
    );
  }

  const { stats, weeks } = dashboard;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/workers")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Trabajadores
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{worker.name}</h1>
        <p className="text-sm text-muted-foreground">
          {worker.isRegular ? "Trabajador fijo" : "Trabajador ocasional"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Total horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stats.totalHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Ganancias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(stats.totalEarnings)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Semanas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stats.weeksActive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" /> Prom. costo/h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(stats.averageHourlyRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Semanas trabajadas</h2>

        {weeks.length === 0 && (
          <p className="text-muted-foreground text-sm">Sin registros</p>
        )}

        <div className="space-y-2">
          {weeks.map((week) => (
            <Link key={week.weekId} to={`/weeks/${week.weekId}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{week.label}</span>
                        <Badge
                          variant={week.status === "saved" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {week.status === "saved" ? "Guardado" : "Borrador"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{week.totalHours}h</span>
                        <span>{formatCurrency(week.totalEarnings)}</span>
                        <span>{week.recordCount} registros</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
