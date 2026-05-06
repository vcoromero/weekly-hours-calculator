import type { WorkRecord } from "@/shared/types";
import { formatDateShort, formatCurrency } from "@/shared/utils/formatters";
import { recordTotal } from "@/shared/utils/calculations";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Trash2 } from "lucide-react";

interface RecordListProps {
  records: WorkRecord[];
  onDelete: (recordId: string) => void;
  isDeleting?: boolean;
}

export function RecordList({ records, onDelete, isDeleting }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg">
        <p>Sin registros aún</p>
        <p className="text-xs mt-1">
          Usa el formulario de arriba para agregar registros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-muted-foreground">
        Registros ({records.length})
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="font-medium text-sm truncate">
                  {record.workerName || "Desconocido"}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {formatDateShort(record.date)}
                </div>
                <div className="text-sm">{record.hours}h</div>
                <div className="text-sm hidden sm:block">
                  {formatCurrency(record.hourlyRate)}/h
                </div>
                <div className="text-sm font-medium text-primary">
                  {formatCurrency(recordTotal(record.hours, record.hourlyRate))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(record.id)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
