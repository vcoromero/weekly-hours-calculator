import { useState } from "react";
import { useNavigate } from "react-router";
import { useWorkers, useWorkerStats } from "@/shared/api/queries";
import { useCreateWorker, useUpdateWorker, useDeleteWorker } from "@/shared/api/mutations";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/utils/formatters";
import {
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  ArrowLeft,
  X,
} from "lucide-react";

interface WorkerFormData {
  name: string;
  isRegular: boolean;
}

export function WorkersPage() {
  const navigate = useNavigate();
  const { data: workers, isLoading, error } = useWorkers();
  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const deleteWorker = useDeleteWorker();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkerFormData>({
    name: "",
    isRegular: true,
  });
  const [filter, setFilter] = useState<"all" | "regular" | "occasional">("all");
  const [statsWorkerId, setStatsWorkerId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await updateWorker.mutateAsync({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        await createWorker.mutateAsync(formData);
      }
      setFormData({ name: "", isRegular: true });
      setShowForm(false);
    } catch {
      // handled by mutation state
    }
  };

  const handleEdit = (worker: { id: string; name: string; isRegular: boolean }) => {
    setFormData({ name: worker.name, isRegular: worker.isRegular });
    setEditingId(worker.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este trabajador?")) return;
    try {
      await deleteWorker.mutateAsync(id);
    } catch {
      // handled by mutation state
    }
  };

  const filtered = workers?.filter((w) => {
    if (filter === "regular") return w.isRegular;
    if (filter === "occasional") return !w.isRegular;
    return true;
  });

  const filterLabels: Record<string, string> = {
    all: "Todos",
    regular: "Fijos",
    occasional: "Ocasionales",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trabajadores</h1>
          <p className="text-sm text-muted-foreground">
            Administra tus trabajadores
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", isRegular: true });
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {editingId ? "Editar trabajador" : "Nuevo trabajador"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nombre del trabajador"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Tipo:</Label>
              <select
                value={formData.isRegular ? "regular" : "occasional"}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    isRegular: e.target.value === "regular",
                  }))
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="regular">Fijo</option>
                <option value="occasional">Ocasional</option>
              </select>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={createWorker.isPending || updateWorker.isPending}
                className="ml-auto"
              >
                {editingId ? "Actualizar" : "Crear"}
              </Button>
            </div>
            {(createWorker.error || updateWorker.error) && (
              <p className="text-xs text-destructive">
                {((createWorker.error || updateWorker.error) as Error)?.message ||
                  "Ocurrió un error"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {(["all", "regular", "occasional"] as const).map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(f)}
          >
            {filterLabels[f]}
          </Badge>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar trabajadores
        </p>
      )}

      {filtered && filtered.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">
          Sin trabajadores
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered?.map((worker) => (
          <Card key={worker.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{worker.name}</span>
                  <span className="ml-2">
                    <Badge
                      variant={worker.isRegular ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {worker.isRegular ? "Fijo" : "Ocasional"}
                    </Badge>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatsWorkerId(
                      statsWorkerId === worker.id ? null : worker.id
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(worker)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(worker.id)}
                    disabled={deleteWorker.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {statsWorkerId === worker.id && (
                <WorkerStatsCard workerId={worker.id} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WorkerStatsCard({ workerId }: { workerId: string }) {
  const { data: stats, isLoading } = useWorkerStats(workerId);

  if (isLoading) {
    return (
      <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
        Cargando estadísticas...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
      <div>
        <span className="text-muted-foreground">Total horas:</span>{" "}
        {stats.totalHours}h
      </div>
      <div>
        <span className="text-muted-foreground">Ganancias:</span>{" "}
        {formatCurrency(stats.totalEarnings)}
      </div>
      <div>
        <span className="text-muted-foreground">Semanas:</span>{" "}
        {stats.weeksActive}
      </div>
      <div>
        <span className="text-muted-foreground">Costo prom.:</span>{" "}
        {formatCurrency(stats.averageHourlyRate)}/h
      </div>
    </div>
  );
}
