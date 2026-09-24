import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, Stat, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { STATUSES } from "@/lib/types";
import { INTERACTION_TYPES } from "@/lib/types";

export const Route = createFileRoute("/statistiques")({
  head: () => ({
    meta: [
      { title: "Statistiques de prospection — Vantail" },
      {
        name: "description",
        content:
          "Suivez votre activité commerciale : prospects contactés, relances, rendez-vous obtenus, répartition par statut et par secteur.",
      },
      { property: "og:title", content: "Statistiques de prospection — Vantail" },
      {
        property: "og:description",
        content:
          "Une lecture simple de votre activité : volumes par statut, interactions par type et progression vers les rendez-vous.",
      },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { prospects } = useStore();

  const interactions = prospects.flatMap((p) => p.interactions);
  const contacted = prospects.filter((p) => p.interactions.length > 0).length;
  const meetings = prospects.filter(
    (p) => p.status === "Rendez-vous obtenu" || p.status === "Opportunité",
  ).length;
  const clients = prospects.filter((p) => p.status === "Client").length;
  const conversion = contacted ? Math.round((meetings / contacted) * 100) : 0;

  const byStatus = STATUSES.map((s) => ({
    status: s,
    count: prospects.filter((p) => p.status === s).length,
  }));
  const maxStatus = Math.max(1, ...byStatus.map((b) => b.count));

  const bySector = Object.entries(
    prospects.reduce<Record<string, number>>((acc, p) => {
      acc[p.sector] = (acc[p.sector] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxSector = Math.max(1, ...bySector.map(([, n]) => n));

  return (
    <AppShell
      eyebrow="Statistiques"
      title="Mon activité commerciale"
      subtitle="Vue simple de votre prospection, basée sur vos interactions enregistrées"
    >
      <section className="card-surface grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        <Stat label="Prospects en base" value={prospects.length} />
        <Stat label="Prospects contactés" value={contacted} />
        <Stat label="Rendez-vous" value={meetings} hint={`${clients} clients`} />
        <Stat label="Taux de RDV" value={`${conversion} %`} hint="sur les contactés" />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <h2 className="text-base font-semibold">Répartition par statut</h2>
          <ul className="mt-4 space-y-3">
            {byStatus.map((b) => (
              <li key={b.status} className="flex items-center gap-4">
                <div className="w-44 shrink-0">
                  <StatusBadge status={b.status} />
                </div>
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${(b.count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold">{b.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <h2 className="text-base font-semibold">Interactions par type</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              {INTERACTION_TYPES.map((t) => (
                <div key={t} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{t}</dt>
                  <dd className="font-semibold">
                    {interactions.filter((i) => i.type === t).length}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold">{interactions.length}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Top secteurs en base</h2>
            <ul className="mt-4 space-y-2.5">
              {bySector.slice(0, 6).map(([sector, n]) => (
                <li key={sector} className="flex items-center gap-3 text-sm">
                  <span className="w-40 shrink-0 truncate text-muted-foreground">
                    {sector}
                  </span>
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-accent/70"
                      style={{ width: `${(n / maxSector) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
