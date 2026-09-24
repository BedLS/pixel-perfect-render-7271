import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";
import type { PriorityLevel } from "@/lib/priority";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border border-border bg-surface text-foreground hover:border-accent/50 hover:text-accent",
        variant === "ghost" && "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "danger" &&
          "border border-destructive/30 text-destructive hover:bg-destructive/10",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card-surface p-5", className)}>{children}</div>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const controlClass =
  "mt-1.5 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "min-h-20", className)} {...props} />;
}

const STATUS_TONE: Record<Status, string> = {
  Nouveau: "bg-muted text-muted-foreground",
  "À contacter": "bg-accent-soft text-accent",
  Contacté: "bg-muted text-muted-foreground",
  "À relancer": "bg-warning-soft text-warning",
  "Rendez-vous obtenu": "bg-success-soft text-success",
  Opportunité: "bg-success-soft text-success",
  Client: "bg-success-soft text-success",
  "Pas intéressé": "bg-muted text-faint",
  "Mauvais prospect": "bg-muted text-faint",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_TONE[status],
      )}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ level, score }: { level: PriorityLevel; score?: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
        level === "élevée"
          ? "bg-accent-soft text-accent"
          : level === "moyenne"
            ? "bg-warning-soft text-warning"
            : "bg-muted text-muted-foreground",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      Priorité {level}
      {typeof score === "number" && <span className="opacity-70">· {score}</span>}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="px-5 py-4">
      <p className="label-eyebrow">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Avatar({ text }: { text: string }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
      {text}
    </div>
  );
}
