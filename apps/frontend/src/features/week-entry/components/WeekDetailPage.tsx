import { useParams, useNavigate } from "react-router";
import { useWeekById } from "@/shared/api/queries";
import { useDeleteWeek } from "@/shared/api/mutations";
import { formatCurrency, formatDateShort } from "@/shared/utils/formatters";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { ArrowLeft, Pencil, Trash2, User } from "lucide-react";
import type { Week } from "@/shared/types";

function groupByWorker(week: Week) {
  const groups = new Map<string, {
    workerId: string;
    workerName: string;
    records: NonNullable<Week["records"]>;
    totalHours: number;
    totalAmount: number;
  }>();

  if (!week.records) return [];

  for (const record of week.records) {
    const existing = groups.get(record.workerId) || {
      workerId: record.workerId,
      workerName: record.workerName || "Unknown",
      records: [],
      totalHours: 0,
      totalAmount: 0,
    };
    existing.records.push(record);
    existing.totalHours = Math.round((existing.totalHours + record.hours) * 100) / 100;
    existing.totalAmount = Math.round(
      (existing.totalAmount + (record.total || record.hours * record.hourlyRate)) * 100
    ) / 100;
    groups.set(record.workerId, existing);
  }

  return Array.from(groups.values());
}

export function WeekDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: week, isLoading, error } = useWeekById(id || "");
  const deleteWeek = useDeleteWeek();

  const handleDelete = async () => {
    if (!id || !confirm("¿Eliminar esta semana permanentemente?")) return;
    try {
      await deleteWeek.mutateAsync(id);
      navigate("/");
    } catch {
      // handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !week) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudo cargar la semana</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  const groups = groupByWorker(week);
  const grandTotal = week.grandTotal || week.totalsByWorker?.reduce(
    (sum, w) => sum + w.totalAmount, 0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Dashboard
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{week.label}</h1>
          <p className="text-sm text-muted-foreground">
            {week.startDate} → {week.endDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/weeks/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteWeek.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deleteWeek.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Sin registros esta semana</p>
        </div>
      )}

      {groups.map((group) => (
        <Card key={group.workerId}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{group.workerName}</CardTitle>
              </div>
              <div className="text-sm font-medium text-primary">
                {group.totalHours}h — {formatCurrency(group.totalAmount)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium text-right">Horas</th>
                    <th className="pb-2 font-medium text-right">Costo/h</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                    <th className="pb-2 font-medium">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {group.records.map((record) => (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="py-2">{formatDateShort(record.date)}</td>
                      <td className="py-2 text-right">{record.hours}h</td>
                      <td className="py-2 text-right">
                        {formatCurrency(record.hourlyRate)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(record.total || record.hours * record.hourlyRate)}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {record.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {groups.length > 0 && (
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Gran total</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
