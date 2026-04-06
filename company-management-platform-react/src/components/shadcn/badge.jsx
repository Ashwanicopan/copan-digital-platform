import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-50 text-indigo-700",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-red-700",
        neutral: "bg-gray-100 text-gray-600",
        info: "bg-cyan-50 text-cyan-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const statusMap = {
  active: "success",
  present: "success",
  approved: "success",
  paid: "success",
  "on-leave": "warning",
  pending: "warning",
  draft: "warning",
  absent: "danger",
  rejected: "danger",
  inactive: "neutral",
};

export function ShadBadge({ status, variant, className, children, ...props }) {
  const resolvedVariant = variant || statusMap[status] || "neutral";
  return (
    <span className={cn(badgeVariants({ variant: resolvedVariant, className }))} {...props}>
      {children || status}
    </span>
  );
}
