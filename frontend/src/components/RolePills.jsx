import { Crown, Code2, Zap, Gem, Star, ShieldCheck, FlaskConical } from "lucide-react";

const ICONS = { crown: Crown, code: Code2, zap: Zap, gem: Gem, star: Star, shield: ShieldCheck, flask: FlaskConical };

function Pill({ role, pad, iconSize }) {
  const Icon = ICONS[role.icon] || Star;
  return (
    <span
      data-testid={`role-pill-${role.id}`}
      title={role.label}
      className={`role-flair inline-flex items-center gap-1 rounded-full border font-medium ${pad}`}
      style={{ color: role.color, "--role-color": role.color }}
    >
      <Icon size={iconSize} />
      {role.label}
    </span>
  );
}

export function RolePills({ roles, size = "sm", equipped = null }) {
  if (!roles?.length) return null;
  const active = Array.isArray(equipped) && equipped.length ? roles.filter((r) => equipped.includes(r.id)) : roles;
  const shown = active.slice(0, 4);
  const shownIds = new Set(shown.map((r) => r.id));
  const rest = roles.filter((r) => !shownIds.has(r.id));
  const pad = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  const iconSize = size === "md" ? 12 : 10;
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-1">
      {shown.map((r) => (
        <Pill key={r.id} role={r} pad={pad} iconSize={iconSize} />
      ))}
      {rest.length > 0 && (
        <span className="group relative inline-flex">
          <span data-testid="roles-more" className={`inline-flex cursor-default items-center rounded-full border border-border bg-secondary font-medium text-muted-foreground ${pad}`}>
            +{rest.length}
          </span>
          <span
            data-testid="roles-more-tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 flex w-max max-w-[240px] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-xl border border-border bg-popover p-2 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
          >
            {rest.map((r) => (
              <Pill key={r.id} role={r} pad="px-2 py-0.5 text-[11px]" iconSize={10} />
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
