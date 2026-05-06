import type { WeekDateRange } from "../models/week.js";

export class WeekCalculator {
  getPreviousWeek(): WeekDateRange {
    const now = new Date();
    const dayOfWeek = now.getDay();

    const daysSinceLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysSinceLastMonday - 7);
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const weekNumber = this.getWeekNumber(lastMonday);
    const label = this.formatLabel(lastMonday, lastSunday, weekNumber);

    return { start: lastMonday, end: lastSunday, label };
  }

  getWeekForDate(dateStr: string): WeekDateRange {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();

    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekNumber = this.getWeekNumber(monday);
    const label = this.formatLabel(monday, sunday, weekNumber);

    return { start: monday, end: sunday, label };
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private formatLabel(start: Date, end: Date, weekNumber: number): string {
    const startStr = start.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `Semana ${weekNumber} · ${startStr} - ${endStr}`;
  }
}
