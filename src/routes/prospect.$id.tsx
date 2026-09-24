import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Avatar,
  Button,
  Card,
  Field,
  Input,
  PriorityBadge,
  Select,
  StatusBadge,
  Textarea,
} from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { computePriority } from "@/lib/priority";
import { formatDate, formatRevenue, initials } from "@/lib/format";
import { INTERACTION_TYPES, SECTORS, STATUSES } from "@/lib/types";
import type { InteractionType, Status } from "@/lib/types";

export const Route = createFileRoute("/prospect/$id")({
  head: () => ({
    meta: [
      { title: "Fiche prospect — Vantail" },
      {
        name: "description",
        content:
          "Fiche détaillée d'une entreprise prospect : coordonnées, contact principal, statut commercial, notes et historique des interactions.",
      },
      { property: "og:title", content: "Fiche prospect — Vantail" },
      {
        property: "og:description",
        content:
          "Toutes les informations utiles avant l'appel, avec l'historique complet des échanges.",
      },
    ],
  }),
  component: ProspectDetail,
});

function ProspectDetail() {
  const { id } = Route.useParams();
  const { prospects, target, setStatus, addNote, addInteraction, updateProspect } =
    useStore();
  const prospect = prospects.find((p) => p.id === id);

  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [interaction, setInteraction] = useState({
    type: "Appel" as InteractionType,
    date: new Date().toISOString().slice(0, 10),
    comment: "",
    nextAction: "",
  });

  if (!prospect) {
    return (
      <AppShell eyebrow="Fiche prospect" title="Prospect introuvable">
        <Card>
          <p className="text-sm text-muted-foreground">
            Ce prospect n'existe pas ou a été supprimé.
          </p>
          <div className="mt-4">
            <Link to="/base-prospects">
              <Button>Retour à la base prospects</Button>
            </Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  const priority = computePriority(prospect, target);

  return (
    <AppShell
      eyebrow="Fiche prospect"
      title={prospect.name}
      subtitle={`${prospect.sector} · ${prospect.city} · ${prospect.employees} salariés · ${formatRevenue(prospect.revenue)}`}
      actions={
        <>
          <a href={`tel:${prospect.phone.replace(/\s/g, "")}`}>
            <Button variant="primary">Appeler</Button>
          </a>
          <a href={`mailto:${prospect.email}`}>
            <Button>Email</Button>
          </a>
          <Button onClick={() => setEditing((v) => !v)}>
            {editing ? "Fermer" : "Modifier"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-7">
          <Card>
            <div className="flex items-start gap-4">
              <Avatar text={initials(prospect.name)} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{prospect.name}</h2>
                  <StatusBadge status={prospect.status} />
                  <PriorityBadge level={priority.level} score={priority.score} />
                </div>
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm text-accent hover:underline"
                >
                  {prospect.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Row label="Secteur" value={prospect.sector} />
              <Row label="Type d'entreprise" value={prospect.companyType} />
              <Row label="Localisation" value={`${prospect.city} (${prospect.region})`} />
              <Row label="Taille" value={`${prospect.employees} salariés`} />
              <Row label="Chiffre d'affaires" value={formatRevenue(prospect.revenue)} />
              <Row label="Téléphone" value={prospect.phone} />
              <Row label="Email" value={prospect.email} />
              <Row label="Contact principal" value={prospect.contactName} />
              <Row label="Fonction" value={prospect.contactRole} />
            </dl>
          </Card>

          {editing && (
            <Card>
              <h2 className="text-base font-semibold">Modifier la fiche</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Entreprise">
                  <Input
                    value={prospect.name}
                    onChange={(e) => updateProspect(prospect.id, { name: e.target.value })}
                  />
                </Field>
                <Field label="Secteur">
                  <Select
                    value={prospect.sector}
                    onChange={(e) =>
                      updateProspect(prospect.id, { sector: e.target.value })
                    }
                  >
                    {SECTORS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Ville">
                  <Input
                    value={prospect.city}
                    onChange={(e) => updateProspect(prospect.id, { city: e.target.value })}
                  />
                </Field>
                <Field label="Nombre de salariés">
                  <Input
                    type="number"
                    value={prospect.employees}
                    onChange={(e) =>
                      updateProspect(prospect.id, { employees: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Chiffre d'affaires (k€)">
                  <Input
                    type="number"
                    value={prospect.revenue}
                    onChange={(e) =>
                      updateProspect(prospect.id, { revenue: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Contact principal">
                  <Input
                    value={prospect.contactName}
                    onChange={(e) =>
                      updateProspect(prospect.id, { contactName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Fonction">
                  <Input
                    value={prospect.contactRole}
                    onChange={(e) =>
                      updateProspect(prospect.id, { contactRole: e.target.value })
                    }
                  />
                </Field>
                <Field label="Téléphone">
                  <Input
                    value={prospect.phone}
                    onChange={(e) => updateProspect(prospect.id, { phone: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={prospect.email}
                    onChange={(e) => updateProspect(prospect.id, { email: e.target.value })}
                  />
                </Field>
                <Field label="Site web">
                  <Input
                    value={prospect.website}
                    onChange={(e) =>
                      updateProspect(prospect.id, { website: e.target.value })
                    }
                  />
                </Field>
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-base font-semibold">Historique des interactions</h2>
            <form
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!interaction.comment.trim()) return;
                addInteraction(prospect.id, {
                  type: interaction.type,
                  date: interaction.date,
                  comment: interaction.comment,
                  ...(interaction.nextAction ? { nextAction: interaction.nextAction } : {}),
                });
                setInteraction({ ...interaction, comment: "", nextAction: "" });
              }}
            >
              <Field label="Type d'interaction">
                <Select
                  value={interaction.type}
                  onChange={(e) =>
                    setInteraction({
                      ...interaction,
                      type: e.target.value as InteractionType,
                    })
                  }
                >
                  {INTERACTION_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Date">
                <Input
                  type="date"
                  value={interaction.date}
                  onChange={(e) => setInteraction({ ...interaction, date: e.target.value })}
                />
              </Field>
              <Field label="Commentaire">
                <Textarea
                  value={interaction.comment}
                  onChange={(e) =>
                    setInteraction({ ...interaction, comment: e.target.value })
                  }
                  placeholder="Ce qui s'est dit, les besoins identifiés…"
                />
              </Field>
              <Field label="Prochaine action">
                <Textarea
                  value={interaction.nextAction}
                  onChange={(e) =>
                    setInteraction({ ...interaction, nextAction: e.target.value })
                  }
                  placeholder="Rappeler le 12, envoyer une proposition…"
                />
              </Field>
              <div className="sm:col-span-2">
                <Button variant="primary" type="submit">
                  Enregistrer l'interaction
                </Button>
              </div>
            </form>

            <ul className="mt-6 divide-y divide-border">
              {prospect.interactions.map((i) => (
                <li key={i.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{i.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(i.date)}</p>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">{i.comment}</p>
                  {i.nextAction && (
                    <p className="mt-1 text-xs text-accent">
                      Prochaine action : {i.nextAction}
                    </p>
                  )}
                </li>
              ))}
              {prospect.interactions.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">
                  Aucune interaction enregistrée.
                </li>
              )}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <h2 className="text-base font-semibold">Statut commercial</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(prospect.id, s as Status)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    prospect.status === s
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Pourquoi ce prospect</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              {priority.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Notes</h2>
            <form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addNote(prospect.id, note.trim());
                setNote("");
              }}
            >
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note…"
              />
              <div className="mt-2">
                <Button type="submit">Ajouter une note</Button>
              </div>
            </form>
            <ul className="mt-4 divide-y divide-border">
              {prospect.notes.map((n) => (
                <li key={n.id} className="py-2.5">
                  <p className="text-xs text-muted-foreground">{formatDate(n.date)}</p>
                  <p className="mt-0.5 text-sm">{n.text}</p>
                </li>
              ))}
              {prospect.notes.length === 0 && (
                <li className="py-2.5 text-sm text-muted-foreground">Aucune note.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-eyebrow">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
