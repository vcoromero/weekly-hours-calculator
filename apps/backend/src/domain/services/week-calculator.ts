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

    const label = this.formatLabel(lastMonday, lastSunday);

    return { start: lastMonday, end: lastSunday, label };
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatLabel(start: Date, end: Date): string {
    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  }
}
