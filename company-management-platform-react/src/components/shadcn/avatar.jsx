import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-20 w-20 text-2xl",
};

const colors = ["bg-indigo-600", "bg-cyan-600", "bg-emerald-600", "bg-amber-600", "bg-red-600", "bg-violet-600", "bg-pink-600", "bg-teal-600"];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function ShadAvatar({ name, initials, avatarUrl, size = "md", className }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn("rounded-full object-cover shrink-0 ring-2 ring-white", sizeClass, className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold text-white shrink-0", sizeClass, getColor(name), className)}>
      {initials || (name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
