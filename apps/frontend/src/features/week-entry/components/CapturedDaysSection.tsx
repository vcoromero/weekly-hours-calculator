import type { WorkRecord } from "@/shared/types";
import { groupRecordsByDate } from "@/shared/utils/grouping";
import { formatDate, formatCurrency, formatHours } from "@/shared/utils/formatters";
import { recordTotal } from "@/shared/utils/calculations";
import { Trash2 } from "lucide-react";

interface CapturedDaysSectionProps {
  capturedRecords: WorkRecord[];
  onDelete: (recordId: string) => void;
  isDeleting?: boolean;
  readOnlyWorkerIds?: Set<string>;
}

export function CapturedDaysSection({ capturedRecords, onDelete, isDeleting, readOnlyWorkerIds }: CapturedDaysSectionProps) {
  if (capturedRecords.length === 0) return null;

  const dateGroups = groupRecordsByDate(capturedRecords);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Días capturados
      </h3>

      {dateGroups.map((group) => (
        <div
          key={group.date}
          className="rounded-lg border bg-muted/30 p-3 space-y-2"
        >
          {/* Day header */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">{formatDate(group.date)}</span>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(group.dayTotal)}
            </span>
          </div>

          {/* Records in this day */}
          {group.records.map((record) => {
            const isReadOnly = readOnlyWorkerIds?.has(record.workerId);
            return (
              <div
                key={record.id}
                className={`flex items-center border-b border-border/50 py-2 ${isReadOnly ? "opacity-50" : ""}`}
              >
                {/* Worker name */}
                <span className="flex-1 min-w-0 truncate text-sm font-medium">
                  {record.workerName || "Desconocido"}
                </span>

                {/* Hours + rate (hidden on mobile) */}
                <span className="text-sm text-muted-foreground hidden sm:inline ml-3 whitespace-nowrap">
                  {formatHours(record.hours)}h · {formatCurrency(record.hourlyRate)}/h
                </span>

                {/* Total */}
                <span className="text-sm font-medium text-primary ml-3 whitespace-nowrap">
                  {formatCurrency(recordTotal(record.hours, record.hourlyRate))}
                </span>

                {/* Delete button */}
                {isReadOnly ? (
                  <span title="Registro bloqueado: trabajador pagado" className="ml-2 shrink-0">
                    <span className="h-4 w-4 text-muted-foreground" />
                  </span>
                ) : (
                  <button
                    onClick={() => onDelete(record.id)}
                    disabled={isDeleting}
                    title="Eliminar registro"
                    className="ml-2 shrink-0 opacity-40 hover:opacity-100 transition-opacity text-destructive disabled:pointer-events-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
