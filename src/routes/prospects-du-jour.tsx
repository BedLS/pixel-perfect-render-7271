import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProspectCard } from "@/components/ProspectCard";
import { Button, Card } from "@/components/ui-kit";
import { dailySelection } from "@/lib/priority";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/prospects-du-jour")({
  head: () => ({
    meta: [
      { title: "Mes 10 prospects du jour — Vantail" },
      {
        name: "description",
        content:
          "Les 10 entreprises à contacter aujourd'hui, classées par score de priorité, avec contact direct et raison de la sélection.",
      },
      { property: "og:title", content: "Mes 10 prospects du jour — Vantail" },
      {
        property: "og:description",
        content:
          "Une file de prospection quotidienne de 10 prospects prioritaires : contact, téléphone, email et raisons de la sélection.",
      },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const { prospects, target } = useStore();
  const daily = dailySelection(prospects, target);
  const high = daily.filter((d) => d.priority.level === "élevée").length;

  return (
    <AppShell
      eyebrow="Prospection du jour"
      title="Mes 10 prospects du jour"
      subtitle={`Classés par score de priorité · ${high} prospects en priorité élevée`}
      actions={
        <Link to="/cible">
          <Button>Ajuster ma cible</Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {daily.map((item, i) => (
          <ProspectCard
            key={item.prospect.id}
            prospect={item.prospect}
            priority={item.priority}
            rank={i + 1}
          />
        ))}
      </div>

      {daily.length === 0 && (
        <Card>
          <p className="text-sm text-muted-foreground">
            Aucun prospect actionnable aujourd'hui. Élargissez vos critères dans « Cible »
            ou ajoutez des prospects dans votre base.
          </p>
        </Card>
      )}
    </AppShell>
  );
}
