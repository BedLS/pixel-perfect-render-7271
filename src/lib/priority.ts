import type { Prospect, Target } from "./types";

export type PriorityLevel = "élevée" | "moyenne" | "faible";

export type Priority = {
  score: number;
  level: PriorityLevel;
  reasons: string[];
};

const ACTIONABLE_STATUSES = ["Nouveau", "À contacter", "À relancer"] as const;

export function isActionable(p: Prospect) {
  return (ACTIONABLE_STATUSES as readonly string[]).includes(p.status);
}

export function matchesTarget(p: Prospect, t: Target) {
  const sectorOk = t.sectors.length === 0 || t.sectors.includes(p.sector);
  const typeOk =
    t.companyTypes.length === 0 || t.companyTypes.includes(p.companyType);
  const employeesOk = p.employees >= t.employeesMin && p.employees <= t.employeesMax;
  const revenueOk = p.revenue >= t.revenueMin && p.revenue <= t.revenueMax;
  return sectorOk && typeOk && employeesOk && revenueOk;
}

export function computePriority(p: Prospect, t: Target): Priority {
  const reasons: string[] = [];
  let score = 0;

  if (t.sectors.length === 0 || t.sectors.includes(p.sector)) {
    score += 25;
    reasons.push("Correspond au secteur ciblé");
  }
  if (p.employees >= t.employeesMin && p.employees <= t.employeesMax) {
    score += 20;
    reasons.push("Taille correspondant aux critères");
  }
  if (p.revenue >= t.revenueMin && p.revenue <= t.revenueMax) {
    score += 15;
    reasons.push("Chiffre d'affaires dans la fourchette");
  }
  if (t.city && p.city.toLowerCase() === t.city.toLowerCase()) {
    score += 15;
    reasons.push("Localisation recherchée");
  }
  if (t.companyTypes.length === 0 || t.companyTypes.includes(p.companyType)) {
    score += 10;
    reasons.push(`Type d'entreprise : ${p.companyType}`);
  }

  if (p.interactions.length === 0) {
    score += 15;
    reasons.push("Jamais contacté");
  } else {
    const last = p.interactions[0];
    const days = last
      ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000)
      : 0;
    if (p.status === "À relancer") {
      score += 12;
      reasons.push(`Relance attendue (dernier contact il y a ${days} j)`);
    }
  }

  score = Math.min(100, score);
  const level: PriorityLevel = score >= 70 ? "élevée" : score >= 45 ? "moyenne" : "faible";

  return { score, level, reasons: reasons.slice(0, 4) };
}

/** Sélection quotidienne déterministe : 10 prospects actionnables au meilleur score. */
export function dailySelection(prospects: Prospect[], target: Target) {
  return prospects
    .filter(isActionable)
    .map((p) => ({ prospect: p, priority: computePriority(p, target) }))
    .sort(
      (a, b) =>
        b.priority.score - a.priority.score ||
        a.prospect.name.localeCompare(b.prospect.name),
    )
    .slice(0, 10);
}
