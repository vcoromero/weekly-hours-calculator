import { useState } from "react";
import { useNavigate } from "react-router";
import { useWorkers } from "@/shared/api/queries";
import { useCreateWorker, useUpdateWorker, useDeleteWorker } from "@/shared/api/mutations";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Pagination } from "@/shared/components/ui/pagination";
import { Plus, Pencil, Trash2, BarChart3, ArrowLeft, X, Search } from "lucide-react";

interface WorkerFormData {
  name: string;
  isRegular: boolean;
}

type WorkerFilter = "all" | "regular" | "occasional";

const DEFAULT_PAGE_SIZE = 10;

export function WorkersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WorkerFilter>("all");

  const isRegularParam = filter === "regular" ? true : filter === "occasional" ? false : undefined;

  const { data, isLoading, error } = useWorkers({
    page,
    pageSize,
    search: search || undefined,
    isRegular: isRegularParam,
  });

  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const deleteWorker = useDeleteWorker();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkerFormData>({
    name: "",
    isRegular: true,
  });

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

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "regular", "occasional"] as const).map((f) => (
            <Badge
              key={f}
              variant={filter === f ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
            >
              {f === "all" ? "Todos" : f === "regular" ? "Fijos" : "Ocasionales"}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading && <Spinner />}

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar trabajadores
        </p>
      )}

      {data && data.items.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">
          Sin trabajadores
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.items.map((worker) => (
            <Card key={worker.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{worker.name}</span>
                    <Badge
                      variant={worker.isRegular ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {worker.isRegular ? "Fijo" : "Ocasional"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/workers/${worker.id}/dashboard`)}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <Pagination
          page={data.pagination.page}
          pageSize={data.pagination.pageSize}
          total={data.pagination.total}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}