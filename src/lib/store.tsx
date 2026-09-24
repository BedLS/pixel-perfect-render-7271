import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_PROSPECTS } from "./data";
import type {
  Interaction,
  InteractionType,
  Prospect,
  Status,
  Target,
} from "./types";

const STORAGE_KEY = "vantail.mvp.v1";

export const DEFAULT_TARGET: Target = {
  sectors: ["BTP", "Industrie", "Transport & Logistique"],
  city: "Montpellier",
  radiusKm: 100,
  employeesMin: 20,
  employeesMax: 250,
  revenueMin: 1000,
  revenueMax: 40000,
  companyTypes: ["PME", "ETI"],
};

type NewProspect = Omit<Prospect, "id" | "notes" | "interactions">;

type Store = {
  prospects: Prospect[];
  target: Target;
  setTarget: (t: Target) => void;
  resetTarget: () => void;
  setStatus: (id: string, status: Status) => void;
  addNote: (id: string, text: string) => void;
  addInteraction: (
    id: string,
    input: { type: InteractionType; date: string; comment: string; nextAction?: string },
  ) => void;
  addProspect: (input: NewProspect) => string;
  updateProspect: (id: string, patch: Partial<Prospect>) => void;
};

const StoreContext = createContext<Store | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [target, setTargetState] = useState<Target>(DEFAULT_TARGET);
  const [loaded, setLoaded] = useState(false);

  // Hydratation depuis le navigateur (après le rendu serveur)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { prospects?: Prospect[]; target?: Target };
        if (parsed.prospects?.length) setProspects(parsed.prospects);
        if (parsed.target) setTargetState({ ...DEFAULT_TARGET, ...parsed.target });
      }
    } catch {
      /* stockage indisponible : on garde les données de démonstration */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ prospects, target }));
    } catch {
      /* ignore */
    }
  }, [prospects, target, loaded]);

  const patch = useCallback((id: string, fn: (p: Prospect) => Prospect) => {
    setProspects((list) => list.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const value = useMemo<Store>(
    () => ({
      prospects,
      target,
      setTarget: (t) => setTargetState(t),
      resetTarget: () => setTargetState(DEFAULT_TARGET),
      setStatus: (id, status) => patch(id, (p) => ({ ...p, status })),
      addNote: (id, text) =>
        patch(id, (p) => ({
          ...p,
          notes: [{ id: uid(), date: new Date().toISOString(), text }, ...p.notes],
        })),
      addInteraction: (id, input) =>
        patch(id, (p) => {
          const interaction: Interaction = {
            id: uid(),
            date: new Date(input.date).toISOString(),
            type: input.type,
            comment: input.comment,
            ...(input.nextAction ? { nextAction: input.nextAction } : {}),
          };
          return {
            ...p,
            interactions: [interaction, ...p.interactions].sort((a, b) =>
              b.date.localeCompare(a.date),
            ),
          };
        }),
      addProspect: (input) => {
        const id = `p-${uid()}`;
        setProspects((list) => [{ ...input, id, notes: [], interactions: [] }, ...list]);
        return id;
      },
      updateProspect: (id, p2) => patch(id, (p) => ({ ...p, ...p2 })),
    }),
    [prospects, target, patch],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans StoreProvider");
  return ctx;
}
