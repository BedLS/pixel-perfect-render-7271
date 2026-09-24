import type { CompanyType, Interaction, Prospect, Status } from "./types";
import { INTERACTION_TYPES, SECTORS } from "./types";

// Générateur déterministe simple (données fictives, reproductibles)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CITIES: { city: string; region: string }[] = [
  { city: "Montpellier", region: "Occitanie" },
  { city: "Toulouse", region: "Occitanie" },
  { city: "Nîmes", region: "Occitanie" },
  { city: "Lyon", region: "Auvergne-Rhône-Alpes" },
  { city: "Grenoble", region: "Auvergne-Rhône-Alpes" },
  { city: "Marseille", region: "Provence-Alpes-Côte d'Azur" },
  { city: "Aix-en-Provence", region: "Provence-Alpes-Côte d'Azur" },
  { city: "Bordeaux", region: "Nouvelle-Aquitaine" },
  { city: "Nantes", region: "Pays de la Loire" },
  { city: "Rennes", region: "Bretagne" },
  { city: "Lille", region: "Hauts-de-France" },
  { city: "Paris", region: "Île-de-France" },
  { city: "Strasbourg", region: "Grand Est" },
  { city: "Dijon", region: "Bourgogne-Franche-Comté" },
];

const PREFIXES = [
  "ABC",
  "Atelier",
  "Groupe",
  "Maison",
  "Cabinet",
  "Société",
  "Ets",
  "Compagnie",
  "Studio",
  "Nord",
];
const CORES = [
  "Construction",
  "Ferrand",
  "Delorme",
  "Mercier",
  "Lambert",
  "Verne",
  "Ardent",
  "Rivage",
  "Béton",
  "Logistique",
  "Meridian",
  "Fontaine",
  "Duval",
  "Baptiste",
  "Cerise",
  "Oriane",
  "Talence",
  "Volta",
  "Lumen",
  "Praxis",
];

const FIRST_NAMES = [
  "Jean",
  "Sophie",
  "Marc",
  "Élise",
  "Julien",
  "Camille",
  "Paul",
  "Nathalie",
  "Thomas",
  "Claire",
  "Laurent",
  "Amélie",
  "Bruno",
  "Sandrine",
];
const LAST_NAMES = [
  "Dupont",
  "Renard",
  "Dubois",
  "Fontaine",
  "Perrin",
  "Mercier",
  "Girard",
  "Leroy",
  "Moreau",
  "Bonnet",
  "Rousseau",
  "Faure",
];
const ROLES = [
  "Directeur général",
  "Directrice générale",
  "Directeur commercial",
  "Directrice des opérations",
  "Responsable achats",
  "Gérant",
  "Directeur administratif et financier",
  "Responsable technique",
];

const COMPANY_TYPES_POOL: CompanyType[] = [
  "TPE",
  "PME",
  "PME",
  "PME",
  "ETI",
  "Startup",
  "Grand groupe",
  "Association",
];

const STATUS_POOL: Status[] = [
  "Nouveau",
  "Nouveau",
  "Nouveau",
  "À contacter",
  "À contacter",
  "Contacté",
  "Contacté",
  "À relancer",
  "À relancer",
  "Rendez-vous obtenu",
  "Opportunité",
  "Client",
  "Pas intéressé",
  "Mauvais prospect",
];

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function daysAgoISO(days: number) {
  const base = new Date("2026-03-16T09:00:00Z").getTime();
  return new Date(base - days * 86400000).toISOString();
}

function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length)]!;
}

function buildProspects(): Prospect[] {
  const rnd = mulberry32(42);
  const list: Prospect[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 48; i++) {
    let name = "";
    let guard = 0;
    do {
      name = `${pick(PREFIXES, rnd())} ${pick(CORES, rnd())}`;
      guard++;
    } while (used.has(name) && guard < 50);
    used.add(name);

    const place = pick(CITIES, rnd());
    const sector = pick(SECTORS, rnd());
    const employees = Math.max(3, Math.round(rnd() * 480));
    const revenue = Math.round((employees * (90 + rnd() * 160)) / 10) * 10; // k€
    const companyType = pick(COMPANY_TYPES_POOL, rnd());
    const first = pick(FIRST_NAMES, rnd());
    const last = pick(LAST_NAMES, rnd());
    const role = pick(ROLES, rnd());
    const status = pick(STATUS_POOL, rnd());
    const domain = `${slug(name)}.fr`;

    const interactions: Interaction[] =
      status === "Nouveau" || status === "À contacter"
        ? []
        : Array.from({ length: 1 + Math.floor(rnd() * 3) }).map((_, k) => {
            const withNext = rnd() > 0.5;
            return {
              id: `int-${i}-${k}`,
              date: daysAgoISO(1 + Math.floor(rnd() * 40)),
              type: pick(INTERACTION_TYPES, rnd()),
              comment:
                "Échange sur les besoins en cours et le calendrier de décision.",
              ...(withNext ? { nextAction: "Rappeler la semaine prochaine" } : {}),
            };
          });

    list.push({
      id: `p-${i + 1}`,
      name,
      sector,
      city: place.city,
      region: place.region,
      employees,
      revenue,
      companyType,
      website: `https://www.${domain}`,
      phone: `04 ${String(60 + Math.floor(rnd() * 39))} ${String(
        10 + Math.floor(rnd() * 89),
      )} ${String(10 + Math.floor(rnd() * 89))} ${String(10 + Math.floor(rnd() * 89))}`,
      email: `${slug(first)}.${slug(last)}@${domain}`,
      contactName: `${first} ${last}`,
      contactRole: role,
      status,
      notes: [],
      interactions: interactions.sort((a, b) => b.date.localeCompare(a.date)),
    });
  }

  return list;
}

export const INITIAL_PROSPECTS: Prospect[] = buildProspects();
