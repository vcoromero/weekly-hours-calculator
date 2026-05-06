import type { Week } from "@/shared/types";
import { formatCurrency, formatDateShort } from "@/shared/utils/formatters";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Check, Edit3 } from "lucide-react";

interface WeekPreviewProps {
  week: Week;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  saveLabel?: string;
}

export function WeekPreview({ week, onSave, onBack, isSaving, saveLabel }: WeekPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{week.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Trabajador</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium text-right">Horas</th>
                  <th className="pb-2 font-medium text-right">Costo/h</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {week.records?.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="py-2">{record.workerName}</td>
                    <td className="py-2 text-muted-foreground">
                      {formatDateShort(record.date)}
                    </td>
                    <td className="py-2 text-right">{record.hours}h</td>
                    <td className="py-2 text-right">
                      {formatCurrency(record.hourlyRate)}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {formatCurrency(record.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
