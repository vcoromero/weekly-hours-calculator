export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateWithYear(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatHours(hours: number): string {
  return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
}
