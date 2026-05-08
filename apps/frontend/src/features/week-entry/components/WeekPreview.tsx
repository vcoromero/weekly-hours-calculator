import type { Week, WorkRecord } from "@/shared/types";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { recordTotal } from "@/shared/utils/calculations";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Check, Edit3, Calendar } from "lucide-react";

interface DateGroup {
  date: string;
  records: WorkRecord[];
  dayTotal: number;
}

function groupRecordsByDate(records: WorkRecord[]): DateGroup[] {
  const map = records.reduce<Record<string, WorkRecord[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});
  return Object.entries(map)
    .map(([date, recs]) => ({
      date,
      records: recs,
      dayTotal: recs.reduce((sum, r) => sum + recordTotal(r.hours, r.hourlyRate), 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

interface WeekPreviewProps {
  week: Week;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  saveLabel?: string;
}

export function WeekPreview({ week, onSave, onBack, isSaving, saveLabel }: WeekPreviewProps) {
  const dateGroups = week.records ? groupRecordsByDate(week.records) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{week.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {dateGroups.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin registros</p>
          ) : (
            <div className="space-y-4">
              {dateGroups.map((group) => (
                <div key={group.date} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded px-3 py-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{formatDate(group.date)}</span>
                    <span className="text-xs">—</span>
                    <span className="text-xs">{group.records.length} registro{group.records.length !== 1 ? "s" : ""}</span>
                    <span className="text-xs">—</span>
                    <span className="text-xs font-medium text-foreground">
                      {formatCurrency(group.dayTotal)}
                    </span>
                  </div>
                  <div className="space-y-2 pl-2">
                    {group.records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 text-sm"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-medium w-32 truncate">{record.workerName}</span>
                          <span className="text-muted-foreground">{record.hours}h</span>
                          <span className="text-muted-foreground hidden sm:block">
                            {formatCurrency(record.hourlyRate)}/h
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(record.total || recordTotal(record.hours, record.hourlyRate))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {week.totalsByWorker && week.totalsByWorker.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totales por trabajador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {week.totalsByWorker.map((t) => (
                <div
                  key={t.workerId}
                  className="flex items-center justify-between border-b pb-2 text-sm"
                >
                  <span className="font-medium">{t.workerName}</span>
                  <span>
                    {t.totalHours}h — {formatCurrency(t.totalAmount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 text-base font-bold">
                <span>Gran total</span>
                <span className="text-primary">
                  {formatCurrency(week.grandTotal || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          <Edit3 className="h-4 w-4 mr-1" />
          Volver a editar
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Check className="h-4 w-4 mr-1" />
          {isSaving ? "Guardando..." : (saveLabel || "Guardar semana")}
        </Button>
      </div>
    </div>
  );
}