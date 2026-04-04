import { getAvatarColor } from "../../utils/helpers";

export default function Avatar({ name, initials, size = "md", className = "", avatarUrl }) {
  const sizeClass = size === "lg" ? "avatar-lg" : "";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`avatar ${sizeClass} ${className}`}
        style={{ objectFit: "cover", borderRadius: "50%" }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: getAvatarColor(name) }}
    >
      {initials}
    </div>
  );
}
