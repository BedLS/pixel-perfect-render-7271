export const STATUSES = [
  "Nouveau",
  "À contacter",
  "Contacté",
  "À relancer",
  "Rendez-vous obtenu",
  "Opportunité",
  "Client",
  "Pas intéressé",
  "Mauvais prospect",
] as const;

export type Status = (typeof STATUSES)[number];

export const INTERACTION_TYPES = ["Appel", "Email", "Rendez-vous", "Autre"] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export type Interaction = {
  id: string;
  date: string; // ISO
  type: InteractionType;
  comment: string;
  nextAction?: string;
};

export type Note = {
  id: string;
  date: string;
  text: string;
};

export type CompanyType =
  | "TPE"
  | "PME"
  | "ETI"
  | "Grand groupe"
  | "Startup"
  | "Association";

export type Prospect = {
  id: string;
  name: string;
  sector: string;
  city: string;
  region: string;
  employees: number;
  revenue: number; // en k€
  companyType: CompanyType;
  website: string;
  phone: string;
  email: string;
  contactName: string;
  contactRole: string;
  status: Status;
  notes: Note[];
  interactions: Interaction[];
};

export type Target = {
  sectors: string[];
  city: string;
  radiusKm: number;
  employeesMin: number;
  employeesMax: number;
  revenueMin: number;
  revenueMax: number;
  companyTypes: CompanyType[];
};

export const SECTORS = [
  "BTP",
  "Industrie",
  "Transport & Logistique",
  "Services informatiques",
  "Conseil",
  "Santé",
  "Commerce de gros",
  "Agroalimentaire",
  "Immobilier",
  "Énergie",
];

export const COMPANY_TYPES: CompanyType[] = [
  "TPE",
  "PME",
  "ETI",
  "Grand groupe",
  "Startup",
  "Association",
];
