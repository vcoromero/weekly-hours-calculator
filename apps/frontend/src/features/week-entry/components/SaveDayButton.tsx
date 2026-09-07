import type { WorkRecord } from "@/shared/types";
import { useLockDay } from "@/shared/api/mutations";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { formatDate } from "@/shared/utils/formatters";
import { Lock } from "lucide-react";

interface SaveDayButtonProps {
  weekId: string;
  unlockedRecords: WorkRecord[];
  weekStatus: "draft" | "saved";
}

export function SaveDayButton({
  weekId,
  unlockedRecords,
  weekStatus,
}: SaveDayButtonProps) {
  const lockDay = useLockDay();

  // Extract unique dates from unlocked records (YYYY-MM-DD)
  const uniqueDates = new Set(
    unlockedRecords.map((r) => r.date.slice(0, 10))
  );

  const isDraft = weekStatus === "draft";
  const hasNoRecords = unlockedRecords.length === 0;
  const hasMultipleDates = uniqueDates.size > 1;
  const singleDate = uniqueDates.size === 1 ? Array.from(uniqueDates)[0] : null;

  // Determine button label
  let buttonLabel = "Guardar día";
  if (singleDate) {
    buttonLabel = `Guardar día (${formatDate(singleDate)})`;
  }

  // Show alert for mixed dates
  if (hasMultipleDates) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            Solo puede haber registros de un día a la vez
          </AlertDescription>
        </Alert>
        <Button disabled className="w-full sm:w-auto">
          <Lock className="h-4 w-4 mr-1" />
          Guardar día
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => lockDay.mutate(weekId)}
      disabled={!isDraft || hasNoRecords || lockDay.isPending}
      className="w-full sm:w-auto"
    >
      <Lock className="h-4 w-4 mr-1" />
      {lockDay.isPending ? "Guardando..." : buttonLabel}
    </Button>
  );
}
