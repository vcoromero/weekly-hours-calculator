import { useState } from "react";
import { useWorkers } from "@/shared/api/queries";
import { useCreateWorker } from "@/shared/api/mutations";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import { UserPlus } from "lucide-react";

interface WorkerSelectorProps {
  value: string;
  onChange: (workerId: string) => void;
  filter?: "all" | "regular" | "occasional";
}

export function WorkerSelector({ value, onChange, filter = "all" }: WorkerSelectorProps) {
  const { data: workers } = useWorkers();
  const createWorker = useCreateWorker();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRegular, setIsRegular] = useState(true);

  const filtered = workers?.filter((w) => {
    if (filter === "regular") return w.isRegular;
    if (filter === "occasional") return !w.isRegular;
    return true;
  });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const worker = await createWorker.mutateAsync({
        name: newName.trim(),
        isRegular,
      });
      onChange(worker.id);
      setNewName("");
      setShowCreate(false);
    } catch {
      // handled by mutation state
    }
  };

  return (
    <div className="space-y-2">
      <Label>Trabajador</Label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled>
            Selecciona un trabajador
          </option>
          {filtered?.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} {w.isRegular ? "(Fijo)" : "(Ocasional)"}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-3 space-y-2">
            <Input
              placeholder="Nombre del trabajador"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs">Tipo:</Label>
              <select
                value={isRegular ? "regular" : "occasional"}
                onChange={(e) => setIsRegular(e.target.value === "regular")}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="regular">Fijo</option>
                <option value="occasional">Ocasional</option>
              </select>
              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={createWorker.isPending}
                className="ml-auto"
              >
                {createWorker.isPending ? "Creando..." : "Crear"}
              </Button>
            </div>
            {createWorker.error && (
              <p className="text-xs text-destructive">
                {(createWorker.error as Error)?.message || "Error al crear trabajador"}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
