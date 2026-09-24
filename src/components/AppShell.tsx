import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { dailySelection } from "@/lib/priority";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/prospects-du-jour", label: "Prospects du jour" },
  { to: "/base-prospects", label: "Base prospects" },
  { to: "/cible", label: "Cible" },
  { to: "/statistiques", label: "Statistiques" },
] as const;

export function AppShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { prospects, target } = useStore();
  const dailyCount = dailySelection(prospects, target).length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <div className="flex items-center gap-2.5 px-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            V
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Vantail</p>
            <p className="label-eyebrow">Prospection B2B</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-0.5">
          <p className="label-eyebrow px-2 pb-2">Navigation</p>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
              activeProps={{ className: "bg-accent-soft text-accent hover:bg-accent-soft" }}
            >
              <span className="size-1.5 rounded-full bg-current opacity-40" />
              {item.label}
              {item.to === "/prospects-du-jour" && (
                <span className="ml-auto rounded-full bg-accent-soft px-1.5 text-[11px] font-semibold text-accent">
                  {dailyCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-border bg-muted/60 px-3 py-3">
          <p className="label-eyebrow">Cible active</p>
          <p className="mt-1 text-sm font-medium">
            {target.sectors.length ? target.sectors.join(", ") : "Tous secteurs"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {target.city || "Toute la France"} · {target.employeesMin}–
            {target.employeesMax} salariés
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-6 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-eyebrow">{eyebrow}</p>
              <h1 className="mt-1 text-xl font-semibold">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground"
              activeProps={{ className: "bg-accent-soft text-accent" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 py-7 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
