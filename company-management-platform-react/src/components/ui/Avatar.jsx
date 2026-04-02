import { getAvatarColor } from "../../utils/helpers";

export default function Avatar({ name, initials, size = "md", className = "" }) {
  const sizeClass = size === "lg" ? "avatar-lg" : "";
  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: getAvatarColor(name) }}
    >
      {initials}
    </div>
  );
}
