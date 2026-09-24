import { Link } from "@tanstack/react-router";
import type { Prospect } from "@/lib/types";
import type { Priority } from "@/lib/priority";
import { formatRevenue, initials } from "@/lib/format";
import { Avatar, Button, PriorityBadge } from "./ui-kit";

export function ProspectCard({
  prospect,
  priority,
  rank,
}: {
  prospect: Prospect;
  priority: Priority;
  rank?: number;
}) {
  return (
    <article className="card-surface p-4 transition-colors hover:border-accent/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar text={initials(prospect.name)} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {typeof rank === "number" && (
                <span className="text-[11px] font-medium text-faint">
                  {String(rank).padStart(2, "0")}
                </span>
              )}
              <p className="truncate text-sm font-semibold">{prospect.name}</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {prospect.sector} · {prospect.city} · {prospect.employees} salariés ·{" "}
              {formatRevenue(prospect.revenue)}
            </p>
          </div>
        </div>
        <PriorityBadge level={priority.level} score={priority.score} />
      </div>

      <p className="mt-3 text-sm text-foreground/85">
        Contact : <span className="font-medium">{prospect.contactName}</span> ·{" "}
        {prospect.contactRole}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {prospect.phone} · {prospect.email}
      </p>

      <div className="mt-3 rounded-md bg-muted/70 px-3 py-2">
        <p className="label-eyebrow">Pourquoi ce prospect</p>
        <ul className="mt-1.5 space-y-0.5 text-sm text-foreground/80">
          {priority.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={`tel:${prospect.phone.replace(/\s/g, "")}`}>
          <Button variant="primary" size="sm">
            Appeler
          </Button>
        </a>
        <a href={`mailto:${prospect.email}`}>
          <Button size="sm">Email</Button>
        </a>
        <Link to="/prospect/$id" params={{ id: prospect.id }}>
          <Button size="sm">Voir la fiche</Button>
        </Link>
      </div>
    </article>
  );
}
