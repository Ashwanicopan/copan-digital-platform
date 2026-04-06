import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[260px] flex-1 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
