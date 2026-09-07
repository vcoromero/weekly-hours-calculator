import type { WorkRecord } from "@/shared/types";
import { groupRecordsByDate } from "@/shared/utils/grouping";
import { formatDate, formatCurrency, formatHours } from "@/shared/utils/formatters";
import { recordTotal } from "@/shared/utils/calculations";
import { Lock, Trash2 } from "lucide-react";

interface RecordListProps {
  records: WorkRecord[];
  onDelete: (recordId: string) => void;
  isDeleting?: boolean;
  readOnlyWorkerIds?: Set<string>;
  headerAction?: React.ReactNode;
}

export function RecordList({ records, onDelete, isDeleting, readOnlyWorkerIds, headerAction }: RecordListProps) {
  const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
  const grandTotal = records.reduce((sum, r) => sum + recordTotal(r.hours, r.hourlyRate), 0);

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg">
        <p>Sin registros aún</p>
        <p className="text-xs mt-1">← usa el formulario de la izquierda</p>
      </div>
    );
  }

  const dateGroups = groupRecordsByDate(records);

  return (
    <div>
      {/* Summary block */}
      <div className="pb-4 border-b border-border/50">
        <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">Total semana</p>
        <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
        <p className="text-sm text-muted-foreground">
          {formatHours(totalHours)}h · {records.length} registro{records.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Header action (e.g. SaveDayButton) */}
      {headerAction && <div className="py-3">{headerAction}</div>}

      {/* Date groups */}
      {dateGroups.map((group) => (
        <div key={group.date}>
          {/* Date header */}
          <div className="text-xs text-muted-foreground py-2 flex justify-between">
            <span>{formatDate(group.date)}</span>
            <span>{formatCurrency(group.dayTotal)}</span>
          </div>

          {/* Hairline rows */}
          {group.records.map((record) => {
            const isReadOnly = readOnlyWorkerIds?.has(record.workerId);
            return (
              <div
                key={record.id}
                className={`flex items-center border-b border-border py-2 ${isReadOnly ? "opacity-50" : ""}`}
              >
                {/* Worker name */}
                <span className="flex-1 min-w-0 truncate text-sm font-medium">
                  {record.workerName || "Desconocido"}
                </span>

                {/* Hours + rate (hidden on mobile) */}
                <span className="text-sm text-muted-foreground hidden sm:inline ml-3 whitespace-nowrap">
                  {record.hours}h · {formatCurrency(record.hourlyRate)}/h
                </span>

                {/* Total */}
                <span className="text-sm font-medium text-primary ml-3 whitespace-nowrap">
                  {formatCurrency(recordTotal(record.hours, record.hourlyRate))}
                </span>

                {/* Delete/Lock */}
                {isReadOnly ? (
                  <span title="Registro bloqueado: trabajador pagado" className="ml-2 shrink-0">
                    <Lock className="h-4 w-4 text-muted-foreground" />
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
