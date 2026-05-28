import type { WorkRecord } from "@/shared/types";
import { formatDate, formatCurrency } from "@/shared/utils/formatters";
import { recordTotal } from "@/shared/utils/calculations";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Trash2, Calendar } from "lucide-react";

interface RecordListProps {
  records: WorkRecord[];
  onDelete: (recordId: string) => void;
  isDeleting?: boolean;
}

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

  const dateGroups = groupRecordsByDate(records);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground">
        Registros ({records.length})
      </h3>
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
              <Card key={record.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="font-medium text-sm truncate w-32">
                      {record.workerName || "Desconocido"}
                    </div>
                    <div className="text-sm">{record.hours}h</div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
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
      ))}
    </div>
  );
}