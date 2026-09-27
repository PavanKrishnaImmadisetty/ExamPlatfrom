/**
 * StatCard.jsx — Reusable stat summary card
 *
 * Props:
 *   title       — string, e.g. "Total Students"
 *   value       — number | string, e.g. 245
 *   icon        — Lucide icon component (optional)
 *   iconColor   — Tailwind text color class for the icon, e.g. "text-[#6C3FF5]"
 *   iconBg      — Tailwind bg color class for the icon wrapper, e.g. "bg-[#F1EDFF]"
 *   trend       — optional string, e.g. "+12 this month" (shown as muted footer)
 *   loading     — boolean, shows skeleton when true
 *
 * Design rules:
 *   - White card, rounded-2xl, very subtle shadow, border
 *   - No heavy gradients or thick accents
 *   - Icon sits in a small colored circle, top-right
 */

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-[#6C3FF5]",
  iconBg = "bg-[#F1EDFF]",
  trend,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3.5 bg-[#EAECF0] rounded w-28" />
            <div className="h-8 bg-[#EAECF0] rounded w-16" />
          </div>
          <div className="w-10 h-10 bg-[#EAECF0] rounded-xl flex-shrink-0" />
        </div>
        {trend && <div className="h-3 bg-[#EAECF0] rounded w-32 mt-4" />}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        {/* Text content */}
        <div className="min-w-0">
          <p className="text-sm text-[#667085] font-medium mb-1.5">{title}</p>
          <p className="text-3xl font-bold text-[#182033] leading-none">
            {value ?? "—"}
          </p>
          {trend && (
            <p className="text-xs text-[#98A2B3] mt-3">{trend}</p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            <Icon size={20} className={iconColor} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}