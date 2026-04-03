import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import * as mock from "../data/mockData";

const DataContext = createContext(null);

// Transform Supabase employee row to match the shape components expect
function transformEmployee(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    department: row.department?.name || "",
    departmentId: row.department_id,
    designation: row.designation,
    location: row.location?.name || "",
    locationId: row.location_id,
    joinDate: row.join_date,
    dob: row.dob,
    salary: Number(row.salary),
    status: row.status,
    avatar: row.avatar,
    manager: row.manager?.name || null,
    managerId: row.manager_id,
    employeeId: row.employee_id,
    roleId: row.role_id,
    roleName: row.role?.name || "",
    paymentMode: row.payment_mode,
    bankName: row.bank_name,
    bankAccount: row.bank_account,
    pan: row.pan,
    uan: row.uan,
    authUserId: row.auth_user_id,
  };
}

function transformAttendance(row) {
  return {
    employeeId: row.employee_id,
    date: row.date,
    clockIn: row.clock_in,
    clockOut: row.clock_out,
    status: row.status,
    hours: row.hours ? Number(row.hours) : null,
  };
}

function transformLeaveRequest(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee?.name || "",
    type: row.leave_type?.type || "",
    leavePolicyId: row.leave_policy_id,
    from: row.from_date,
    to: row.to_date,
    days: Number(row.days),
    reason: row.reason,
    status: row.status,
    appliedOn: row.applied_on?.split("T")[0] || "",
    reviewedBy: row.reviewed_by,
  };
}

function transformLeaveBalance(row) {
  return {
    employeeId: row.employee_id,
    leavePolicyId: row.leave_policy_id,
    type: row.leave_type?.type || "",
    balance: Number(row.balance),
    used: Number(row.used),
    year: row.year,
  };
}

function transformPayroll(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    month: row.month,
    year: row.year,
    totalCalendarDays: row.total_calendar_days,
    weekends: row.weekends,
    holidays: row.holidays,
    totalWorkingDays: row.total_working_days,
    presentDays: Number(row.present_days),
    paidLeaveDays: Number(row.paid_leave_days),
    unpaidLeaveDays: Number(row.unpaid_leave_days),
    lateDays: row.late_days,
    lateDeductionDays: Number(row.late_deduction_days),
    halfDays: row.half_days,
    payableDays: Number(row.payable_days),
    ctc: Number(row.ctc),
    basic: Number(row.basic),
    hra: Number(row.hra),
    specialAllowance: Number(row.special_allowance),
    conveyance: Number(row.conveyance),
    medical: Number(row.medical),
    grossEarnings: Number(row.gross_earnings),
    pfEmployee: Number(row.pf_employee),
    pfEmployer: Number(row.pf_employer),
    professionalTax: Number(row.professional_tax),
    tds: Number(row.tds),
    lopDeduction: Number(row.lop_deduction),
    totalDeductions: Number(row.total_deductions),
    netPay: Number(row.net_pay),
    status: row.status,
    paidOn: row.paid_on,
    emp: row.employee ? {
      id: row.employee.id,
      name: row.employee.name,
      employeeId: row.employee.employee_id,
      avatar: row.employee.avatar,
      designation: row.employee.designation,
      department: row.employee.department?.name || "",
      bankName: row.employee.bank_name,
      bankAccount: row.employee.bank_account,
      pan: row.employee.pan,
      uan: row.employee.uan,
      paymentMode: row.employee.payment_mode,
      location: row.employee.location?.name || "",
      joinDate: row.employee.join_date,
    } : null,
  };
}

function transformAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    category: row.category,
    author: row.author_name || "Admin",
    date: row.date,
  };
}

function transformTeam(row, employees) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    managerId: row.manager_id,
    memberIds: (row.members || []).map((m) => m.employee_id),
  };
}

function transformHoliday(row) {
  return {
    date: row.date,
    name: row.name,
    type: row.type,
  };
}

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState(mock.EMPLOYEES_DATA);
  const [attendance, setAttendance] = useState(mock.ATTENDANCE_DATA);
  const [leaveRequests, setLeaveRequests] = useState(mock.LEAVE_REQUESTS_DATA);
  const [leaveBalances, setLeaveBalances] = useState(mock.LEAVE_BALANCE_DATA);
  const [payroll, setPayroll] = useState(mock.PAYROLL_DATA);
  const [announcements, setAnnouncements] = useState(mock.ANNOUNCEMENTS_DATA);
  const [teams, setTeams] = useState(mock.TEAMS_DATA);
  const [holidays, setHolidays] = useState(mock.HOLIDAYS);
  const [departments, setDepartments] = useState(mock.COMPANY.departments);
  const [locations, setLocations] = useState(mock.COMPANY.locations);
  const [loading, setLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);

  const fetchAll = useCallback(async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setLoading(false);
      return;
    }

    try {
      // Fetch employees
      const { data: empData, error: empErr } = await supabase
        .from("employees")
        .select(`*, department:departments(id, name), location:locations(id, name), role:roles(id, name, color), manager:employees!manager_id(id, name, employee_id)`)
        .order("name");

      if (empErr) throw empErr;

      const transformedEmps = empData.map(transformEmployee);
      setEmployees(transformedEmps);

      // Fetch departments
      const { data: deptData } = await supabase.from("departments").select("*").order("name");
      if (deptData) setDepartments(deptData.map((d) => d.name));

      // Fetch locations
      const { data: locData } = await supabase.from("locations").select("*").order("name");
      if (locData) setLocations(locData.map((l) => l.name));

      // Fetch attendance
      const { data: attData } = await supabase.from("attendance").select("*").order("date", { ascending: false });
      if (attData) setAttendance(attData.map(transformAttendance));

      // Fetch leave requests
      const { data: leaveData } = await supabase
        .from("leave_requests")
        .select(`*, employee:employees(id, name, employee_id, avatar), leave_type:leave_policies(id, type)`)
        .order("applied_on", { ascending: false });
      if (leaveData) setLeaveRequests(leaveData.map(transformLeaveRequest));

      // Fetch leave balances
      const { data: balData } = await supabase
        .from("leave_balances")
        .select(`*, leave_type:leave_policies(id, type)`)
        .eq("year", new Date().getFullYear());
      if (balData) setLeaveBalances(balData.map(transformLeaveBalance));

      // Fetch payroll
      const { data: payData } = await supabase
        .from("payroll")
        .select(`*, employee:employees(id, name, employee_id, avatar, designation, department:departments(name), bank_name, bank_account, pan, uan, payment_mode, location:locations(name), join_date)`)
        .order("employee_id");
      if (payData) setPayroll(payData.map(transformPayroll));

      // Fetch announcements
      const { data: annData } = await supabase
        .from("announcements")
        .select(`*, author_name:employees!author_id(name)`)
        .order("date", { ascending: false });
      if (annData) {
        setAnnouncements(annData.map((a) => ({
          ...transformAnnouncement(a),
          author: a.author_name?.name || "Admin",
        })));
      }

      // Fetch teams with members
      const { data: teamData } = await supabase.from("teams").select("*").order("name");
      if (teamData) {
        const { data: memberData } = await supabase.from("team_members").select("*");
        const teamsWithMembers = teamData.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          managerId: t.manager_id,
          memberIds: (memberData || []).filter((m) => m.team_id === t.id).map((m) => m.employee_id),
        }));
        setTeams(teamsWithMembers);
      }

      // Fetch holidays
      const { data: holData } = await supabase.from("holidays").select("*").order("date");
      if (holData) setHolidays(holData.map(transformHoliday));

      setUsingSupabase(true);
    } catch (err) {
      console.warn("Supabase fetch failed, using mock data:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // CRUD helpers that work with Supabase or fallback to local state
  async function addEmployee(empData) {
    if (usingSupabase) {
      const { data, error } = await supabase.from("employees").insert({
        employee_id: empData.employeeId,
        name: empData.name,
        email: empData.email,
        department_id: empData.departmentId,
        designation: empData.designation,
        location_id: empData.locationId,
        join_date: empData.joinDate || new Date().toISOString().split("T")[0],
        status: "active",
        avatar: empData.avatar,
        role_id: empData.roleId || 4,
      }).select(`*, department:departments(id, name), location:locations(id, name), role:roles(id, name, color), manager:employees!manager_id(id, name, employee_id)`).single();
      if (error) throw error;
      const emp = transformEmployee(data);
      setEmployees((prev) => [...prev, emp]);
      return emp;
    } else {
      const newEmp = { ...empData, id: employees.length + 1 };
      setEmployees((prev) => [...prev, newEmp]);
      return newEmp;
    }
  }

  async function addLeaveRequest(reqData) {
    if (usingSupabase) {
      const { data, error } = await supabase.from("leave_requests").insert({
        employee_id: reqData.employeeId,
        leave_policy_id: reqData.leavePolicyId,
        from_date: reqData.from,
        to_date: reqData.to,
        days: reqData.days,
        reason: reqData.reason,
      }).select(`*, employee:employees(id, name, employee_id, avatar), leave_type:leave_policies(id, type)`).single();
      if (error) throw error;
      const req = transformLeaveRequest(data);
      setLeaveRequests((prev) => [req, ...prev]);
      return req;
    } else {
      const newReq = { id: Date.now(), ...reqData, status: "pending", appliedOn: new Date().toISOString().split("T")[0] };
      setLeaveRequests((prev) => [newReq, ...prev]);
      return newReq;
    }
  }

  async function updateLeaveStatus(id, status) {
    if (usingSupabase) {
      const { error } = await supabase.from("leave_requests").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    }
    setLeaveRequests((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function addAnnouncement(annData) {
    if (usingSupabase) {
      const { data, error } = await supabase.from("announcements").insert({
        title: annData.title,
        message: annData.message,
        category: annData.category,
        author_id: annData.authorId,
        date: new Date().toISOString().split("T")[0],
      }).select(`*, author_name:employees!author_id(name)`).single();
      if (error) throw error;
      const ann = { ...transformAnnouncement(data), author: data.author_name?.name || annData.author };
      setAnnouncements((prev) => [ann, ...prev]);
      return ann;
    } else {
      const newAnn = { id: Date.now(), ...annData, date: new Date().toISOString().split("T")[0] };
      setAnnouncements((prev) => [newAnn, ...prev]);
      return newAnn;
    }
  }

  async function deleteAnnouncement(id) {
    if (usingSupabase) {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  async function addTeam(teamData) {
    if (usingSupabase) {
      const { data, error } = await supabase.from("teams").insert({
        name: teamData.name,
        description: teamData.description,
        manager_id: teamData.managerId,
      }).select().single();
      if (error) throw error;
      if (teamData.memberIds?.length) {
        await supabase.from("team_members").insert(
          teamData.memberIds.map((eid) => ({ team_id: data.id, employee_id: eid }))
        );
      }
      const newTeam = { id: data.id, name: data.name, description: data.description, managerId: data.manager_id, memberIds: teamData.memberIds || [] };
      setTeams((prev) => [...prev, newTeam]);
      return newTeam;
    } else {
      const newTeam = { id: Date.now(), ...teamData };
      setTeams((prev) => [...prev, newTeam]);
      return newTeam;
    }
  }

  async function updateTeam(id, teamData) {
    if (usingSupabase) {
      await supabase.from("teams").update({ name: teamData.name, description: teamData.description, manager_id: teamData.managerId }).eq("id", id);
      await supabase.from("team_members").delete().eq("team_id", id);
      if (teamData.memberIds?.length) {
        await supabase.from("team_members").insert(
          teamData.memberIds.map((eid) => ({ team_id: id, employee_id: eid }))
        );
      }
    }
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...teamData } : t)));
  }

  async function deleteTeam(id) {
    if (usingSupabase) {
      await supabase.from("team_members").delete().eq("team_id", id);
      await supabase.from("teams").delete().eq("id", id);
    }
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }

  async function clockIn(employeeId) {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (usingSupabase) {
      const { data, error } = await supabase.from("attendance").upsert({
        employee_id: employeeId,
        date: today,
        clock_in: now,
        status: "present",
      }, { onConflict: "employee_id,date" }).select().single();
      if (error) throw error;
      setAttendance((prev) => [...prev.filter((a) => !(a.employeeId === employeeId && a.date === today)), transformAttendance(data)]);
    } else {
      setAttendance((prev) => [...prev, { employeeId, date: today, clockIn: now, clockOut: null, status: "present", hours: null }]);
    }
    return now;
  }

  async function clockOut(employeeId) {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (usingSupabase) {
      const existing = attendance.find((a) => a.employeeId === employeeId && a.date === today);
      let hours = null;
      if (existing?.clockIn) {
        const [inH, inM] = existing.clockIn.split(":").map(Number);
        const [outH, outM] = now.split(":").map(Number);
        hours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 10) / 10;
      }
      const { data, error } = await supabase.from("attendance").update({ clock_out: now, hours }).eq("employee_id", employeeId).eq("date", today).select().single();
      if (error) throw error;
      setAttendance((prev) => prev.map((a) => (a.employeeId === employeeId && a.date === today) ? transformAttendance(data) : a));
    } else {
      setAttendance((prev) => prev.map((a) => (a.employeeId === employeeId && a.date === today) ? { ...a, clockOut: now } : a));
    }
    return now;
  }

  const value = {
    // Data
    employees,
    attendance,
    leaveRequests,
    leaveBalances,
    payroll,
    announcements,
    teams,
    holidays,
    departments,
    locations,
    loading,
    usingSupabase,
    // Actions
    addEmployee,
    addLeaveRequest,
    updateLeaveStatus,
    addAnnouncement,
    deleteAnnouncement,
    addTeam,
    updateTeam,
    deleteTeam,
    clockIn,
    clockOut,
    refresh: fetchAll,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
