import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Field, Input, Select } from "@/components/ui-kit";
import { DEFAULT_TARGET, useStore } from "@/lib/store";
import { matchesTarget } from "@/lib/priority";
import { COMPANY_TYPES, SECTORS } from "@/lib/types";
import type { CompanyType, Target } from "@/lib/types";
import { formatRevenue } from "@/lib/format";

export const Route = createFileRoute("/cible")({
  head: () => ({
    meta: [
      { title: "Ma cible commerciale — Vantail" },
      {
        name: "description",
        content:
          "Définissez votre cible de prospection : secteurs, localisation, rayon géographique, effectif, chiffre d'affaires et type d'entreprise.",
      },
      { property: "og:title", content: "Ma cible commerciale — Vantail" },
      {
        property: "og:description",
        content:
          "Des critères clairs et modifiables qui alimentent votre sélection quotidienne de 10 prospects.",
      },
    ],
  }),
  component: TargetPage,
});

function TargetPage() {
  const { target, setTarget, resetTarget, prospects } = useStore();
  const [draft, setDraft] = useState<Target>(target);
  const [saved, setSaved] = useState(false);

  const matching = prospects.filter((p) => matchesTarget(p, draft));

  function update(patch: Partial<Target>) {
    setDraft({ ...draft, ...patch });
    setSaved(false);
  }

  function toggleSector(s: string) {
    update({
      sectors: draft.sectors.includes(s)
        ? draft.sectors.filter((x) => x !== s)
        : [...draft.sectors, s],
    });
  }

  function toggleType(t: CompanyType) {
    update({
      companyTypes: draft.companyTypes.includes(t)
        ? draft.companyTypes.filter((x) => x !== t)
        : [...draft.companyTypes, t],
    });
  }

  return (
    <AppShell
      eyebrow="Cible"
      title="Ma cible commerciale"
      subtitle={`${matching.length} entreprises de la base correspondent à ces critères`}
      actions={
        <>
          <Button
            onClick={() => {
              resetTarget();
              setDraft(DEFAULT_TARGET);
              setSaved(false);
            }}
          >
            Réinitialiser
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setTarget(draft);
              setSaved(true);
            }}
          >
            Enregistrer la cible
          </Button>
        </>
      }
    >
      {saved && (
        <p className="mb-5 rounded-md border border-border bg-success-soft px-4 py-2.5 text-sm text-success">
          Cible enregistrée. Votre sélection quotidienne est mise à jour.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          <Card>
            <h2 className="text-base font-semibold">Secteurs d'activité</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {SECTORS.map((s) => {
                const on = draft.sectors.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSector(s)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      on
                        ? "border-accent/40 bg-accent-soft text-accent"
                        : "border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Aucun secteur sélectionné = tous les secteurs.
            </p>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Zone géographique</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ville de référence">
                <Input
                  value={draft.city}
                  onChange={(e) => update({ city: e.target.value })}
                  placeholder="Montpellier"
                />
              </Field>
              <Field label={`Rayon géographique : ${draft.radiusKm} km`}>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={10}
                  value={draft.radiusKm}
                  onChange={(e) => update({ radiusKm: Number(e.target.value) })}
                  className="mt-3 w-full accent-[var(--accent)]"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Taille et chiffre d'affaires</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Salariés minimum">
                <Input
                  type="number"
                  value={draft.employeesMin}
                  onChange={(e) => update({ employeesMin: Number(e.target.value) })}
                />
              </Field>
              <Field label="Salariés maximum">
                <Input
                  type="number"
                  value={draft.employeesMax}
                  onChange={(e) => update({ employeesMax: Number(e.target.value) })}
                />
              </Field>
              <Field label="CA minimum (k€)">
                <Input
                  type="number"
                  step={100}
                  value={draft.revenueMin}
                  onChange={(e) => update({ revenueMin: Number(e.target.value) })}
                />
              </Field>
              <Field label="CA maximum (k€)">
                <Input
                  type="number"
                  step={100}
                  value={draft.revenueMax}
                  onChange={(e) => update({ revenueMax: Number(e.target.value) })}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Type d'entreprise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {COMPANY_TYPES.map((t) => {
                const on = draft.companyTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      on
                        ? "border-accent/40 bg-accent-soft text-accent"
                        : "border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4">
          <Card className="sticky top-28">
            <h2 className="text-base font-semibold">Aperçu de la cible</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row
                label="Secteurs"
                value={draft.sectors.length ? draft.sectors.join(", ") : "Tous"}
              />
              <Row label="Zone" value={`${draft.city || "Toute la France"} · ${draft.radiusKm} km`} />
              <Row
                label="Effectif"
                value={`${draft.employeesMin} – ${draft.employeesMax} salariés`}
              />
              <Row
                label="CA"
                value={`${formatRevenue(draft.revenueMin)} – ${formatRevenue(draft.revenueMax)}`}
              />
              <Row
                label="Types"
                value={draft.companyTypes.length ? draft.companyTypes.join(", ") : "Tous"}
              />
            </dl>
            <div className="mt-5 rounded-md bg-muted/70 px-4 py-3">
              <p className="text-2xl font-semibold">{matching.length}</p>
              <p className="text-xs text-muted-foreground">
                entreprises correspondantes en base
              </p>
            </div>
            <div className="mt-4">
              <Link to="/prospects-du-jour">
                <Button className="w-full">Voir mes 10 prospects du jour</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

// Select est importé pour rester disponible dans les évolutions du formulaire
void Select;
