import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useCurrentWeek, useWeekRecords, useWeekById } from "@/shared/api/queries";
import {
  useAddRecord,
  useDeleteRecord,
  useSaveWeek,
  useUpdateWeek,
} from "@/shared/api/mutations";
import { api } from "@/shared/api/client";
import type { CreateRecordInput, Week, WorkRecord } from "@/shared/types";
import { RecordForm } from "./RecordForm";
import { RecordList } from "./RecordList";
import { WeekPreview } from "./WeekPreview";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Step = "entry" | "preview";

export function WeekEntryPage() {
  const navigate = useNavigate();
  const { id: editWeekId } = useParams<{ id: string }>();
  const isEditing = Boolean(editWeekId);

  const [step, setStep] = useState<Step>("entry");
  const [previewData, setPreviewData] = useState<Week | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: currentWeek, isLoading: currentLoading } = useCurrentWeek();
  const { data: editWeek, isLoading: editLoading } = useWeekById(editWeekId || "");
  const week = isEditing ? editWeek : currentWeek;
  const isLoading = isEditing ? editLoading : currentLoading;

  const { data: existingRecords } = useWeekRecords(week?.id || "");
  const addRecord = useAddRecord();
  const deleteRecord = useDeleteRecord();
  const saveWeek = useSaveWeek();
  const updateWeek = useUpdateWeek();

  const handleAddRecord = useCallback(
    (data: CreateRecordInput) => {
      if (!week) return;
      addRecord.mutate({ ...data, weekId: week.id });
    },
    [week, addRecord]
  );

  const handleDeleteRecord = useCallback(
    (recordId: string) => {
      deleteRecord.mutate(recordId);
    },
    [deleteRecord]
  );

  const handlePreview = async () => {
    if (!week || !existingRecords || existingRecords.length === 0) return;
    setSaveError(null);

    const previewRecords = existingRecords.map((r) => ({
      workerId: r.workerId,
      date: r.date,
      hours: r.hours,
      hourlyRate: r.hourlyRate,
      description: r.description || undefined,
    }));

    try {
      const preview = await api.post<Week>("/weeks/preview", {
        weekId: week.id,
        records: previewRecords,
      });
      setPreviewData(preview);
      setStep("preview");
    } catch (err) {
      setSaveError((err as Error)?.message || "Error al previsualizar");
    }
  };

  const handleSave = async () => {
    if (!week || !previewData?.records || previewData.records.length === 0) {
      setSaveError("No hay registros para guardar");
      return;
    }
    setSaveError(null);

    const records = previewData.records.map((r) => ({
      workerId: r.workerId,
      date: r.date,
      hours: r.hours,
      hourlyRate: r.hourlyRate,
      description: r.description || undefined,
    }));

    try {
      if (isEditing) {
        await updateWeek.mutateAsync({ id: week.id, records });
      } else {
        await saveWeek.mutateAsync({ weekId: week.id, records });
      }
      navigate(isEditing ? `/weeks/${week.id}` : "/");
    } catch (err) {
      setSaveError((err as Error)?.message || "Error al guardar la semana");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!week) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudo cargar la semana</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  const records: WorkRecord[] = existingRecords || [];

  if (step === "preview" && previewData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
        </div>

        {saveError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <WeekPreview
          week={previewData}
          onSave={handleSave}
          onBack={() => { setSaveError(null); setStep("entry"); }}
          isSaving={saveWeek.isPending || updateWeek.isPending}
          saveLabel={isEditing ? "Actualizar semana" : "Guardar semana"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1 as unknown as number)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {isEditing ? "Volver" : "Dashboard"}
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {week.label}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Editando semana" : `Estado: ${week.status === "saved" ? "Guardado" : "Borrador"}`}
          </p>
        </div>
      </div>

      <RecordForm
        weekStart={week.startDate}
        weekEnd={week.endDate}
        onSubmit={handleAddRecord}
        isSubmitting={addRecord.isPending}
      />

      {addRecord.error && (
        <p className="text-sm text-destructive">
          {(addRecord.error as Error)?.message || "Error al agregar registro"}
        </p>
      )}

      <RecordList
        records={records}
        onDelete={handleDeleteRecord}
        isDeleting={deleteRecord.isPending}
      />

      <div className="flex justify-end border-t pt-4">
        <Button onClick={handlePreview} disabled={records.length === 0}>
          Vista previa y guardar
        </Button>
      </div>
    </div>
  );
}
