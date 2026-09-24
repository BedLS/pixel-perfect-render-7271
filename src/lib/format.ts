export function formatRevenue(kEuros: number) {
  if (kEuros >= 1000) {
    return `${(kEuros / 1000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    })} M€`;
  }
  return `${kEuros.toLocaleString("fr-FR")} k€`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
