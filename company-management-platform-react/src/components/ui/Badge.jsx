import { getStatusBadge } from "../../utils/helpers";

export default function Badge({ status, children }) {
  return <span className={`badge ${getStatusBadge(status)}`}>{children || status}</span>;
}
