import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { CreateRecordInput, Worker } from "@/shared/types";
import { WorkerSelector } from "./WorkerSelector";
import { Plus } from "lucide-react";

const DEFAULT_HOURS = 8;
const DEFAULT_HOURLY_RATE = 15;

const recordSchema = z.object({
  workerId: z.string().min(1, "Selecciona un trabajador"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hours: z.coerce.number().positive("Las horas deben ser mayores a 0"),
  hourlyRate: z.coerce.number().positive("El costo debe ser mayor a 0"),
  description: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormProps {
  weekStart: string;
  weekEnd: string;
  workers: Worker[];
  onSubmit: (data: CreateRecordInput) => void;
  isSubmitting: boolean;
}

export function RecordForm({
  weekStart,
  weekEnd,
  workers,
  onSubmit,
  isSubmitting,
}: RecordFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      hours: DEFAULT_HOURS,
      hourlyRate: DEFAULT_HOURLY_RATE,
      date: weekStart,
    },
  });

  const workerId = watch("workerId");

  const handleFormSubmit = (data: RecordFormData) => {
    onSubmit({
      workerId: data.workerId,
      date: data.date,
      hours: data.hours,
      hourlyRate: data.hourlyRate,
      description: data.description,
    });
    reset({
      workerId: data.workerId,
      hours: data.hours,
      hourlyRate: data.hourlyRate,
      date: data.date,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <WorkerSelector
          value={workerId || ""}
          onChange={(id) => setValue("workerId", id, { shouldValidate: true })}
          workers={workers}
        />

        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            className="h-10"
            {...register("date")}
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours">Horas</Label>
          <Input
            id="hours"
            type="number"
            step="0.5"
            min="0"
            placeholder="8"
            className="h-10"
            {...register("hours")}
          />
          {errors.hours && (
            <p className="text-xs text-destructive">{errors.hours.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Costo/hora ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            placeholder="15"
            className="h-10"
            {...register("hourlyRate")}
          />
          {errors.hourlyRate && (
            <p className="text-xs text-destructive">
              {errors.hourlyRate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Ej. Turno mañana"
          className="h-10"
          {...register("description")}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-1" />
        {isSubmitting ? "Agregando..." : "Agregar registro"}
      </Button>
    </form>
  );
}
