import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  StatusBadge,
} from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { formatDate, formatRevenue } from "@/lib/format";
import { COMPANY_TYPES, SECTORS, STATUSES } from "@/lib/types";
import type { CompanyType, Status } from "@/lib/types";

export const Route = createFileRoute("/base-prospects")({
  head: () => ({
    meta: [
      { title: "Base prospects — Vantail" },
      {
        name: "description",
        content:
          "Toutes vos entreprises prospects dans un tableau filtrable : secteur, localisation, effectif, chiffre d'affaires, contact, statut et dernière interaction.",
      },
      { property: "og:title", content: "Base prospects — Vantail" },
      {
        property: "og:description",
        content:
          "Recherche, filtres, tri et ajout manuel : la base centralisée de vos prospects B2B.",
      },
    ],
  }),
  component: BasePage,
});

type SortKey = "name" | "employees" | "revenue" | "lastInteraction";

const PAGE_SIZE = 12;

function BasePage() {
  const { prospects, addProspect } = useStore();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = prospects.filter((p) => {
      const matchQ =
        !q ||
        [p.name, p.city, p.sector, p.contactName, p.email].some((v) =>
          v.toLowerCase().includes(q),
        );
      return matchQ && (!sector || p.sector === sector) && (!status || p.status === status);
    });

    const dir = sortAsc ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "employees") return (a.employees - b.employees) * dir;
      if (sortKey === "revenue") return (a.revenue - b.revenue) * dir;
      if (sortKey === "lastInteraction") {
        return (
          (a.interactions[0]?.date ?? "").localeCompare(b.interactions[0]?.date ?? "") * dir
        );
      }
      return a.name.localeCompare(b.name) * dir;
    });
  }, [prospects, search, sector, status, sortKey, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <AppShell
      eyebrow="Base prospects"
      title="Base de prospects"
      subtitle={`${filtered.length} entreprises sur ${prospects.length}`}
      actions={
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Fermer" : "Ajouter un prospect"}
        </Button>
      }
    >
      {showForm && (
        <div className="mb-6">
          <AddProspectForm
            onSubmit={(input) => {
              addProspect(input);
              setShowForm(false);
              setPage(1);
            }}
          />
        </div>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Recherche">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Entreprise, ville, contact…"
            />
          </Field>
          <Field label="Secteur">
            <Select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous secteurs</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Statut">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous statuts</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tri">
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="name">Entreprise</option>
              <option value="employees">Nombre de salariés</option>
              <option value="revenue">Chiffre d'affaires</option>
              <option value="lastInteraction">Dernière interaction</option>
            </Select>
          </Field>
        </div>
      </Card>

      <div className="card-surface mt-5 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th onClick={() => toggleSort("name")}>Entreprise</Th>
              <Th>Secteur</Th>
              <Th>Localisation</Th>
              <Th onClick={() => toggleSort("employees")}>Salariés</Th>
              <Th onClick={() => toggleSort("revenue")}>CA</Th>
              <Th>Contact principal</Th>
              <Th>Fonction</Th>
              <Th>Téléphone</Th>
              <Th>Email</Th>
              <Th>Statut</Th>
              <Th onClick={() => toggleSort("lastInteraction")}>Dernière interaction</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-muted/60">
                <td className="px-4 py-3 font-medium">
                  <Link
                    to="/prospect/$id"
                    params={{ id: p.id }}
                    className="hover:text-accent"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.sector}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.employees}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRevenue(p.revenue)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.contactName}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.contactRole}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.interactions[0] ? formatDate(p.interactions[0].date) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                  Aucun prospect ne correspond à ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page {current} sur {pageCount}
        </p>
        <div className="flex gap-2">
          <Button size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
            Précédent
          </Button>
          <Button
            size="sm"
            disabled={current >= pageCount}
            onClick={() => setPage(current + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <th
      onClick={onClick}
      className={`label-eyebrow px-4 py-3 font-semibold ${onClick ? "cursor-pointer select-none hover:text-accent" : ""}`}
    >
      {children}
    </th>
  );
}

function AddProspectForm({
  onSubmit,
}: {
  onSubmit: (input: {
    name: string;
    sector: string;
    city: string;
    region: string;
    employees: number;
    revenue: number;
    companyType: CompanyType;
    website: string;
    phone: string;
    email: string;
    contactName: string;
    contactRole: string;
    status: Status;
  }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    sector: SECTORS[0]!,
    city: "",
    region: "",
    employees: "20",
    revenue: "2000",
    companyType: "PME" as CompanyType,
    website: "",
    phone: "",
    email: "",
    contactName: "",
    contactRole: "",
    status: "Nouveau" as Status,
  });

  return (
    <Card>
      <h2 className="text-base font-semibold">Ajouter un prospect</h2>
      <form
        className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          onSubmit({
            ...form,
            employees: Number(form.employees) || 0,
            revenue: Number(form.revenue) || 0,
          });
        }}
      >
        <Field label="Entreprise">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Secteur">
          <Select
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
          >
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Type d'entreprise">
          <Select
            value={form.companyType}
            onChange={(e) =>
              setForm({ ...form, companyType: e.target.value as CompanyType })
            }
          >
            {COMPANY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ville">
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </Field>
        <Field label="Région">
          <Input
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </Field>
        <Field label="Site web">
          <Input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://"
          />
        </Field>
        <Field label="Nombre de salariés">
          <Input
            type="number"
            value={form.employees}
            onChange={(e) => setForm({ ...form, employees: e.target.value })}
          />
        </Field>
        <Field label="Chiffre d'affaires (k€)">
          <Input
            type="number"
            value={form.revenue}
            onChange={(e) => setForm({ ...form, revenue: e.target.value })}
          />
        </Field>
        <Field label="Statut">
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Contact principal">
          <Input
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          />
        </Field>
        <Field label="Fonction">
          <Input
            value={form.contactRole}
            onChange={(e) => setForm({ ...form, contactRole: e.target.value })}
          />
        </Field>
        <Field label="Téléphone">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <div className="flex items-end md:col-span-3">
          <Button variant="primary" type="submit">
            Enregistrer le prospect
          </Button>
        </div>
      </form>
    </Card>
  );
}
