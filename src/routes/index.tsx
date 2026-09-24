import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProspectCard } from "@/components/ProspectCard";
import { Button, Card, Stat, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { computePriority, dailySelection } from "@/lib/priority";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Vantail, assistant quotidien de prospection B2B" },
      {
        name: "description",
        content:
          "Ne cherchez plus qui prospecter. Vantail affiche chaque jour vos 10 prospects prioritaires, leurs contacts et vos actions du jour.",
      },
      { property: "og:title", content: "Vantail — Sachez qui contacter aujourd'hui" },
      {
        property: "og:description",
        content:
          "Assistant quotidien de prospection B2B : cible commerciale, base de prospects et 10 prospects prioritaires par jour.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { prospects, target } = useStore();
  const daily = dailySelection(prospects, target);

  const today = new Date().toDateString();
  const contactedToday = prospects.filter((p) =>
    p.interactions.some((i) => new Date(i.date).toDateString() === today),
  ).length;
  const followUps = prospects.filter((p) => p.status === "À relancer").length;
  const meetings = prospects.filter(
    (p) => p.status === "Rendez-vous obtenu" || p.status === "Opportunité",
  ).length;
  const clients = prospects.filter((p) => p.status === "Client").length;
  const contacted = prospects.filter((p) => p.interactions.length > 0).length;
  const conversion = contacted ? Math.round((meetings / contacted) * 100) : 0;

  const recent = prospects
    .filter((p) => p.interactions.length > 0)
    .sort((a, b) =>
      (b.interactions[0]?.date ?? "").localeCompare(a.interactions[0]?.date ?? ""),
    )
    .slice(0, 6);

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Sachez qui contacter aujourd'hui"
      subtitle={`${daily.length} prospects prioritaires · ${followUps} relances en attente`}
      actions={
        <Link to="/prospects-du-jour">
          <Button variant="primary">Voir mes 10 prospects du jour</Button>
        </Link>
      }
    >
      <section className="card-surface grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        <Stat label="À contacter aujourd'hui" value={daily.length} hint="sélection du jour" />
        <Stat label="Contactés aujourd'hui" value={contactedToday} hint="appels et emails" />
        <Stat label="Relances à faire" value={followUps} hint="statut « À relancer »" />
        <Stat label="Rendez-vous obtenus" value={meetings} hint={`${clients} clients signés`} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Aperçu des 10 prospects du jour</h2>
            <Link
              to="/prospects-du-jour"
              className="text-sm font-medium text-accent hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {daily.slice(0, 3).map((item, i) => (
              <ProspectCard
                key={item.prospect.id}
                prospect={item.prospect}
                priority={item.priority}
                rank={i + 1}
              />
            ))}
            {daily.length === 0 && (
              <Card>
                <p className="text-sm text-muted-foreground">
                  Aucun prospect actionnable. Élargissez vos critères dans « Cible ».
                </p>
              </Card>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <h2 className="text-base font-semibold">Statistiques de prospection</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Prospects en base" value={prospects.length} />
              <Row label="Prospects contactés" value={contacted} />
              <Row label="Dans la cible actuelle" value={daily.length ? `${daily.length}+` : 0} />
              <Row label="Taux de transformation en RDV" value={`${conversion} %`} />
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Dernières interactions</h2>
            <ul className="mt-4 divide-y divide-border">
              {recent.map((p) => {
                const last = p.interactions[0]!;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link
                        to="/prospect/$id"
                        params={{ id: p.id }}
                        className="truncate text-sm font-medium hover:text-accent"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {last.type} · {formatDate(last.date)}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <Card>
          <h2 className="text-base font-semibold">Priorités par statut</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Score moyen de priorité des prospects actionnables, selon votre cible.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["Nouveau", "À contacter", "À relancer"] as const).map((s) => {
              const group = prospects.filter((p) => p.status === s);
              const avg = group.length
                ? Math.round(
                    group.reduce((acc, p) => acc + computePriority(p, target).score, 0) /
                      group.length,
                  )
                : 0;
              return (
                <div key={s} className="rounded-md border border-border px-4 py-3">
                  <StatusBadge status={s} />
                  <p className="mt-2 text-2xl font-semibold">{group.length}</p>
                  <p className="text-xs text-muted-foreground">Score moyen {avg}/100</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
