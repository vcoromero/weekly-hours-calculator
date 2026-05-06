import { useState } from "react";
import { useCreateWorker } from "@/shared/api/mutations";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { UserPlus } from "lucide-react";
import type { Worker } from "@/shared/types";

interface WorkerSelectorProps {
  value: string;
  onChange: (workerId: string) => void;
  workers: Worker[];
  filter?: "all" | "regular" | "occasional";
}

export function WorkerSelector({
  value,
  onChange,
  workers,
  filter = "all",
}: WorkerSelectorProps) {
  const createWorker = useCreateWorker();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRegular, setIsRegular] = useState(true);

  const filtered = workers.filter((w) => {
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
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un trabajador" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name} {w.isRegular ? "(Fijo)" : "(Ocasional)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <Select
                value={isRegular ? "regular" : "occasional"}
                onValueChange={(v) => setIsRegular(v === "regular")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Fijo</SelectItem>
                  <SelectItem value="occasional">Ocasional</SelectItem>
                </SelectContent>
              </Select>
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
