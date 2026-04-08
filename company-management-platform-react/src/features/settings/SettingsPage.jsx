import { useState } from "react";
import Header from "../../components/layout/Header";
import { COMPANY } from "../../data/mockData";
import CompanySettings from "./tabs/CompanySettings";
import RolesSettings from "./tabs/RolesSettings";
import LeavePolicySettings from "./tabs/LeavePolicySettings";
import NotificationSettings from "./tabs/NotificationSettings";
import PayrollSettings from "./tabs/PayrollSettings";
import PenaltyRulesSettings from "./tabs/PenaltyRulesSettings";
import HolidaySettings from "./tabs/HolidaySettings";
import OrganizationSettings from "./tabs/OrganizationSettings";
import ShiftSettings from "./tabs/ShiftSettings";
import BulkLeaveAllocation from "./tabs/BulkLeaveAllocation";
import AuditLogSettings from "./tabs/AuditLogSettings";

const tabs = [
  { id: "company", icon: "fa-building", label: "Company Profile" },
  { id: "organization", icon: "fa-sitemap", label: "Organization" },
  { id: "shifts", icon: "fa-clock", label: "Shifts" },
  { id: "roles", icon: "fa-user-shield", label: "Roles & Permissions" },
  { id: "leave-policy", icon: "fa-calendar-alt", label: "Leave Policy" },
  { id: "holidays", icon: "fa-umbrella-beach", label: "Holidays" },
  { id: "bulk-leave", icon: "fa-users-cog", label: "Bulk Leave Allocation" },
  { id: "penalty-rules", icon: "fa-gavel", label: "Penalty Rules" },
  { id: "notifications", icon: "fa-bell", label: "Notifications" },
  { id: "payroll-settings", icon: "fa-wallet", label: "Payroll Config" },
  { id: "audit-logs", icon: "fa-history", label: "Audit Logs" },
];

const tabComponents = {
  company: CompanySettings,
  organization: OrganizationSettings,
  shifts: ShiftSettings,
  roles: RolesSettings,
  "leave-policy": LeavePolicySettings,
  holidays: HolidaySettings,
  "bulk-leave": BulkLeaveAllocation,
  "penalty-rules": PenaltyRulesSettings,
  notifications: NotificationSettings,
  "payroll-settings": PayrollSettings,
  "audit-logs": AuditLogSettings,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const TabContent = tabComponents[activeTab];

  return (
    <>
      <Header title="Settings" />
      <div className="page-content">
        <div className="settings-layout">
          <div className="settings-sidebar">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`settings-nav-item ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <i className={`fas ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>
          <div className="settings-content">
            <TabContent />
          </div>
        </div>
      </div>
    </>
  );
}
