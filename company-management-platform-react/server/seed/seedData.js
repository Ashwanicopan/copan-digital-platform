require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const Payroll = require("../models/Payroll");
const Team = require("../models/Team");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const Holiday = require("../models/Holiday");
const Company = require("../models/Company");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB. Seeding...");

  // Clear all collections
  await Promise.all([
    User.deleteMany(), Employee.deleteMany(), Attendance.deleteMany(),
    Leave.deleteMany(), LeaveBalance.deleteMany(), Payroll.deleteMany(),
    Team.deleteMany(), Announcement.deleteMany(), Notification.deleteMany(),
    Holiday.deleteMany(), Company.deleteMany(),
  ]);

  // Company
  await Company.create({
    name: "Copan", logo: "CD",
    departments: ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"],
    locations: ["Mumbai", "Bangalore", "Delhi", "Pune"],
    industry: "Information Technology", size: "51-200", foundedYear: "2018",
    email: "hr@copancs.com", phone: "+91 22 4567 8900",
    address: "Tower B, Cyber City, Sector 24, Mumbai, Maharashtra 400001",
  });

  // Employees
  const employeesData = [
    { employeeId: "CD-1001", name: "Aarav Sharma", email: "aarav.sharma@copancs.com", phone: "+91 98765 43210", department: "Engineering", designation: "Senior Developer", location: "Bangalore", joinDate: "2022-03-15", dob: "1995-04-02", salary: 120000, status: "active", avatar: "AS", manager: "Priya Patel" },
    { employeeId: "CD-1002", name: "Priya Patel", email: "priya.patel@copancs.com", phone: "+91 98765 43211", department: "Engineering", designation: "Engineering Manager", location: "Bangalore", joinDate: "2020-01-10", dob: "1990-07-22", salary: 180000, status: "active", avatar: "PP", manager: "Rajesh Kumar" },
    { employeeId: "CD-1003", name: "Rajesh Kumar", email: "rajesh.kumar@copancs.com", phone: "+91 98765 43212", department: "Engineering", designation: "VP Engineering", location: "Mumbai", joinDate: "2019-06-01", dob: "1985-12-10", salary: 250000, status: "active", avatar: "RK", manager: null },
    { employeeId: "CD-1004", name: "Sneha Reddy", email: "sneha.reddy@copancs.com", phone: "+91 98765 43213", department: "Design", designation: "UI/UX Lead", location: "Bangalore", joinDate: "2021-08-20", dob: "1993-04-05", salary: 140000, status: "active", avatar: "SR", manager: "Rajesh Kumar" },
    { employeeId: "CD-1005", name: "Amit Verma", email: "amit.verma@copancs.com", phone: "+91 98765 43214", department: "Marketing", designation: "Marketing Manager", location: "Mumbai", joinDate: "2021-02-14", dob: "1992-09-18", salary: 130000, status: "active", avatar: "AV", manager: "Rajesh Kumar" },
    { employeeId: "CD-1006", name: "Kavya Nair", email: "kavya.nair@copancs.com", phone: "+91 98765 43215", department: "HR", designation: "HR Manager", location: "Mumbai", joinDate: "2020-11-05", dob: "1991-04-03", salary: 110000, status: "active", avatar: "KN", manager: "Rajesh Kumar" },
    { employeeId: "CD-1007", name: "Vikram Singh", email: "vikram.singh@copancs.com", phone: "+91 98765 43216", department: "Sales", designation: "Sales Lead", location: "Delhi", joinDate: "2022-07-18", dob: "1994-01-30", salary: 125000, status: "active", avatar: "VS", manager: "Amit Verma" },
    { employeeId: "CD-1008", name: "Ananya Gupta", email: "ananya.gupta@copancs.com", phone: "+91 98765 43217", department: "Engineering", designation: "Frontend Developer", location: "Bangalore", joinDate: "2023-01-09", dob: "1998-06-14", salary: 90000, status: "active", avatar: "AG", manager: "Priya Patel" },
    { employeeId: "CD-1009", name: "Rohan Mehta", email: "rohan.mehta@copancs.com", phone: "+91 98765 43218", department: "Finance", designation: "Finance Analyst", location: "Mumbai", joinDate: "2022-09-12", dob: "1996-11-25", salary: 95000, status: "active", avatar: "RM", manager: "Rajesh Kumar" },
    { employeeId: "CD-1010", name: "Deepa Iyer", email: "deepa.iyer@copancs.com", phone: "+91 98765 43219", department: "Engineering", designation: "Backend Developer", location: "Pune", joinDate: "2023-04-03", dob: "1997-04-07", salary: 95000, status: "on-leave", avatar: "DI", manager: "Priya Patel" },
    { employeeId: "CD-1011", name: "Arjun Rao", email: "arjun.rao@copancs.com", phone: "+91 98765 43220", department: "Operations", designation: "Ops Manager", location: "Delhi", joinDate: "2021-05-22", dob: "1993-08-09", salary: 115000, status: "active", avatar: "AR", manager: "Rajesh Kumar" },
    { employeeId: "CD-1012", name: "Meera Joshi", email: "meera.joshi@copancs.com", phone: "+91 98765 43221", department: "Design", designation: "Graphic Designer", location: "Pune", joinDate: "2023-06-15", dob: "1999-04-02", salary: 75000, status: "active", avatar: "MJ", manager: "Sneha Reddy" },
  ];

  const employees = await Employee.insertMany(employeesData);
  const empMap = {};
  employees.forEach((e) => { empMap[e.employeeId] = e; });
  console.log(`Seeded ${employees.length} employees`);

  // Users (login accounts)
  const adminUser = await User.create({ name: "Kavya Nair", email: "admin@copancs.com", password: "admin123", role: "admin", avatar: "KN", employeeRef: empMap["CD-1006"]._id });
  const managerUser = await User.create({ name: "Priya Patel", email: "priya@copancs.com", password: "manager123", role: "manager", avatar: "PP", employeeRef: empMap["CD-1002"]._id });
  const employeeUser = await User.create({ name: "Aarav Sharma", email: "aarav@copancs.com", password: "emp123", role: "employee", avatar: "AS", employeeRef: empMap["CD-1001"]._id });
  console.log("Seeded 3 users");

  // Link users to employees
  await Employee.findByIdAndUpdate(empMap["CD-1006"]._id, { user: adminUser._id });
  await Employee.findByIdAndUpdate(empMap["CD-1002"]._id, { user: managerUser._id });
  await Employee.findByIdAndUpdate(empMap["CD-1001"]._id, { user: employeeUser._id });

  // Leave Balances
  const balances = [
    { employee: empMap["CD-1001"]._id, casual: 8, sick: 6, earned: 12, compOff: 1 },
    { employee: empMap["CD-1002"]._id, casual: 10, sick: 7, earned: 15, compOff: 0 },
    { employee: empMap["CD-1003"]._id, casual: 10, sick: 7, earned: 18, compOff: 2 },
    { employee: empMap["CD-1004"]._id, casual: 9, sick: 5, earned: 10, compOff: 0 },
    { employee: empMap["CD-1005"]._id, casual: 7, sick: 7, earned: 8, compOff: 1 },
    { employee: empMap["CD-1006"]._id, casual: 10, sick: 7, earned: 15, compOff: 2 },
    { employee: empMap["CD-1008"]._id, casual: 10, sick: 5, earned: 6, compOff: 0 },
    { employee: empMap["CD-1010"]._id, casual: 6, sick: 2, earned: 10, compOff: 0 },
  ];
  await LeaveBalance.insertMany(balances);
  console.log("Seeded leave balances");

  // Attendance (March 2026 - full month for payroll testing)
  const attendanceData = [];
  const marchWorkDays = [];
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(2026, 2, d); // March 2026
    const day = dt.getDay();
    if (day !== 0 && day !== 6) marchWorkDays.push(dt.toISOString().split("T")[0]);
  }

  // Generate attendance for all employees for March
  const allEmps = Object.values(empMap);
  for (const emp of allEmps) {
    for (const dateStr of marchWorkDays) {
      // Deepa is on leave from Mar 30
      if (emp.employeeId === "CD-1010" && dateStr >= "2026-03-30") {
        attendanceData.push({ employee: emp._id, date: dateStr, status: "on-leave", hours: 0 });
        continue;
      }
      // Amit absent on Mar 28
      if (emp.employeeId === "CD-1005" && dateStr === "2026-03-28") {
        attendanceData.push({ employee: emp._id, date: dateStr, status: "absent", hours: 0 });
        continue;
      }

      // Some employees arrive late on certain days
      let clockIn, isLate = false, lateByMinutes = 0;
      const dayNum = new Date(dateStr).getDate();

      if (emp.employeeId === "CD-1001" && [3, 10, 17, 24].includes(dayNum)) {
        // Aarav late 4 times in March
        clockIn = "10:15";
        isLate = true;
        lateByMinutes = 45;
      } else if (emp.employeeId === "CD-1008" && [5, 12, 19].includes(dayNum)) {
        // Ananya late 3 times
        clockIn = "10:00";
        isLate = true;
        lateByMinutes = 30;
      } else {
        // Normal arrival between 09:00 and 09:40
        const mins = 540 + Math.floor(Math.random() * 40);
        clockIn = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
      }

      const outMins = 1080 + Math.floor(Math.random() * 60); // 18:00-19:00
      const clockOut = `${String(Math.floor(outMins / 60)).padStart(2, "0")}:${String(outMins % 60).padStart(2, "0")}`;
      const [inH, inM] = clockIn.split(":").map(Number);
      const hours = parseFloat(((outMins - inH * 60 - inM) / 60).toFixed(1));

      attendanceData.push({
        employee: emp._id, date: dateStr, clockIn, clockOut,
        status: "present", hours, isLate, lateByMinutes,
      });
    }
  }

  // April 1 attendance
  attendanceData.push(
    { employee: empMap["CD-1001"]._id, date: "2026-04-01", clockIn: "09:05", clockOut: "18:30", status: "present", hours: 9.4 },
    { employee: empMap["CD-1002"]._id, date: "2026-04-01", clockIn: "08:45", clockOut: "18:15", status: "present", hours: 9.5 },
    { employee: empMap["CD-1003"]._id, date: "2026-04-01", clockIn: "10:00", clockOut: "19:00", status: "present", hours: 9.0, isLate: true, lateByMinutes: 30 },
    { employee: empMap["CD-1004"]._id, date: "2026-04-01", clockIn: "09:30", clockOut: "18:00", status: "present", hours: 8.5 },
    { employee: empMap["CD-1005"]._id, date: "2026-04-01", clockIn: null, clockOut: null, status: "absent", hours: 0 },
    { employee: empMap["CD-1006"]._id, date: "2026-04-01", clockIn: "09:15", clockOut: "17:45", status: "present", hours: 8.5 },
    { employee: empMap["CD-1007"]._id, date: "2026-04-01", clockIn: "09:00", clockOut: "18:00", status: "present", hours: 9.0 },
    { employee: empMap["CD-1008"]._id, date: "2026-04-01", clockIn: "10:10", clockOut: "18:20", status: "present", hours: 8.2, isLate: true, lateByMinutes: 40 },
    { employee: empMap["CD-1010"]._id, date: "2026-04-01", clockIn: null, clockOut: null, status: "on-leave", hours: 0 },
  );

  await Attendance.insertMany(attendanceData);
  console.log(`Seeded ${attendanceData.length} attendance records`);

  // Regularization requests
  const Regularization = require("../models/Regularization");
  await Regularization.deleteMany();
  await Regularization.insertMany([
    {
      employee: empMap["CD-1001"]._id, employeeName: "Aarav Sharma", date: "2026-03-10",
      type: "late-arrival", originalClockIn: "10:15", originalClockOut: "19:30",
      requestedClockIn: "09:30", requestedClockOut: "19:30",
      reason: "Had a doctor appointment in the morning, worked extended hours to compensate",
      status: "approved", reviewedAt: new Date("2026-03-11"),
    },
    {
      employee: empMap["CD-1001"]._id, employeeName: "Aarav Sharma", date: "2026-03-24",
      type: "late-arrival", originalClockIn: "10:15", originalClockOut: "19:00",
      requestedClockIn: "09:30", requestedClockOut: "19:00",
      reason: "Metro delay due to technical issue",
      status: "pending",
    },
    {
      employee: empMap["CD-1008"]._id, employeeName: "Ananya Gupta", date: "2026-03-19",
      type: "forgot-clockin", originalClockIn: null, originalClockOut: "18:30",
      requestedClockIn: "09:15", requestedClockOut: "18:30",
      reason: "Forgot to clock in, was working from office the whole day",
      status: "pending",
    },
    {
      employee: empMap["CD-1003"]._id, employeeName: "Rajesh Kumar", date: "2026-04-01",
      type: "late-arrival", originalClockIn: "10:00", originalClockOut: "19:00",
      requestedClockIn: "09:30", requestedClockOut: "19:00",
      reason: "Client call ran late in the morning",
      status: "pending",
    },
  ]);
  console.log("Seeded regularization requests");

  // Leaves
  const leavesData = [
    { employee: empMap["CD-1010"]._id, employeeName: "Deepa Iyer", type: "Sick Leave", from: "2026-03-30", to: "2026-04-03", days: 5, reason: "Medical procedure", status: "approved" },
    { employee: empMap["CD-1001"]._id, employeeName: "Aarav Sharma", type: "Casual Leave", from: "2026-04-10", to: "2026-04-11", days: 2, reason: "Personal work", status: "pending" },
    { employee: empMap["CD-1005"]._id, employeeName: "Amit Verma", type: "Earned Leave", from: "2026-04-15", to: "2026-04-20", days: 5, reason: "Family vacation", status: "pending" },
    { employee: empMap["CD-1008"]._id, employeeName: "Ananya Gupta", type: "Sick Leave", from: "2026-03-20", to: "2026-03-21", days: 2, reason: "Fever", status: "approved" },
    { employee: empMap["CD-1007"]._id, employeeName: "Vikram Singh", type: "Casual Leave", from: "2026-03-28", to: "2026-03-28", days: 1, reason: "Personal errand", status: "rejected" },
  ];
  await Leave.insertMany(leavesData);
  console.log("Seeded leaves");

  // Payroll - generate using the calculation engine for March 2026
  function buildPayroll(emp, presentDays, lateDays, unpaidLeaveDays) {
    const ctc = emp.salary;
    const basic = Math.round(ctc * 0.50);
    const hra = Math.round(basic * 0.40);
    const pfEmployer = Math.round(Math.min(basic, 15000) * 0.12);
    const specialAllowance = Math.max(0, ctc - basic - hra - pfEmployer);
    const grossEarnings = basic + hra + specialAllowance + 1600 + 1250;
    const pfEmployee = Math.round(Math.min(basic, 15000) * 0.12);
    const lateDeductionDays = Math.floor(lateDays / 3) * 0.5;
    const totalUnpaid = unpaidLeaveDays + lateDeductionDays;
    const totalWorkingDays = 22;
    const payableDays = totalWorkingDays - totalUnpaid;
    const perDay = grossEarnings / totalWorkingDays;
    const lopDeduction = Math.round(perDay * totalUnpaid);
    const annualTaxable = (grossEarnings - pfEmployee) * 12 - 75000;
    let tax = 0, remaining = Math.max(0, annualTaxable);
    for (const [limit, rate] of [[400000,0],[400000,0.05],[400000,0.10],[400000,0.15],[400000,0.20],[Infinity,0.30]]) {
      if (remaining <= 0) break;
      tax += Math.min(remaining, limit) * rate;
      remaining -= limit;
    }
    const tds = Math.round((tax + tax * 0.04) / 12);
    const totalDeductions = pfEmployee + 200 + tds + lopDeduction;
    return {
      employee: emp._id, month: "March 2026", year: 2026, monthNum: 3,
      totalCalendarDays: 31, weekends: 8, holidays: 1, totalWorkingDays,
      presentDays, paidLeaveDays: 0, unpaidLeaveDays: totalUnpaid,
      lateDays, lateDeductionDays, halfDays: 0, payableDays,
      ctc, basic, hra, specialAllowance, conveyanceAllowance: 1600, medicalAllowance: 1250, otherAllowances: 0,
      grossEarnings, pfEmployee, pfEmployer, professionalTax: 200, tds, lopDeduction, otherDeductions: 0,
      totalDeductions, netPay: Math.round(grossEarnings - totalDeductions),
      status: "paid", paidOn: "2026-03-28",
    };
  }
  await Payroll.insertMany([
    buildPayroll(empMap["CD-1001"], 21, 4, 0),
    buildPayroll(empMap["CD-1002"], 22, 0, 0),
    buildPayroll(empMap["CD-1003"], 22, 0, 0),
    buildPayroll(empMap["CD-1004"], 22, 0, 0),
    buildPayroll(empMap["CD-1005"], 21, 0, 1),
    buildPayroll(empMap["CD-1006"], 22, 0, 0),
    buildPayroll(empMap["CD-1007"], 22, 0, 0),
    buildPayroll(empMap["CD-1008"], 22, 3, 0),
    buildPayroll(empMap["CD-1009"], 22, 0, 0),
    buildPayroll(empMap["CD-1010"], 20, 0, 2),
    buildPayroll(empMap["CD-1011"], 22, 0, 0),
    buildPayroll(empMap["CD-1012"], 22, 0, 0),
  ]);
  console.log("Seeded payroll for all 12 employees");

  // Teams
  await Team.insertMany([
    { name: "Frontend Squad", manager: empMap["CD-1002"]._id, members: [empMap["CD-1001"]._id, empMap["CD-1008"]._id, empMap["CD-1010"]._id], description: "Frontend development team" },
    { name: "Backend Core", manager: empMap["CD-1003"]._id, members: [empMap["CD-1002"]._id, empMap["CD-1010"]._id], description: "Core backend services" },
    { name: "Design Studio", manager: empMap["CD-1004"]._id, members: [empMap["CD-1012"]._id], description: "Product design and creative assets" },
    { name: "Growth Team", manager: empMap["CD-1005"]._id, members: [empMap["CD-1007"]._id], description: "Marketing, sales and growth" },
  ]);
  console.log("Seeded teams");

  // Announcements
  await Announcement.insertMany([
    { title: "Annual Company Offsite", message: "Our annual offsite is scheduled for April 25-27 in Goa. Details to follow.", category: "event", author: "Kavya Nair" },
    { title: "New Health Insurance Policy", message: "We've upgraded our health insurance coverage. Check your email for details.", category: "policy", author: "Kavya Nair" },
    { title: "Q1 Town Hall", message: "Q1 results town hall on April 5th at 3 PM. All hands mandatory.", category: "general", author: "Rajesh Kumar" },
  ]);
  console.log("Seeded announcements");

  // Notifications (for admin user)
  await Notification.insertMany([
    { user: adminUser._id, type: "leave", icon: "fa-calendar-alt", title: "Leave Request", message: "Aarav Sharma applied for 2 days casual leave", read: false },
    { user: adminUser._id, type: "leave", icon: "fa-calendar-alt", title: "Leave Request", message: "Amit Verma applied for 5 days earned leave", read: false },
    { user: adminUser._id, type: "announcement", icon: "fa-bullhorn", title: "New Announcement", message: "Annual Company Offsite scheduled for April 25-27", read: false },
    { user: adminUser._id, type: "payroll", icon: "fa-wallet", title: "Payroll Processed", message: "March 2026 payroll has been completed", read: true },
    { user: adminUser._id, type: "employee", icon: "fa-user-plus", title: "New Employee", message: "Meera Joshi has joined the Design team", read: true },
    { user: adminUser._id, type: "attendance", icon: "fa-clock", title: "Attendance Alert", message: "Amit Verma was absent yesterday without leave", read: false },
  ]);
  console.log("Seeded notifications");

  // Holidays
  await Holiday.insertMany([
    { date: "2026-01-26", name: "Republic Day", type: "national" },
    { date: "2026-03-10", name: "Holi", type: "festival" },
    { date: "2026-03-30", name: "Id-ul-Fitr", type: "festival" },
    { date: "2026-04-06", name: "Ram Navami", type: "festival" },
    { date: "2026-04-14", name: "Ambedkar Jayanti", type: "national" },
    { date: "2026-04-18", name: "Good Friday", type: "festival" },
    { date: "2026-05-01", name: "May Day", type: "national" },
    { date: "2026-06-06", name: "Id-ul-Zuha (Bakrid)", type: "festival" },
    { date: "2026-07-06", name: "Muharram", type: "festival" },
    { date: "2026-08-15", name: "Independence Day", type: "national" },
    { date: "2026-08-25", name: "Janmashtami", type: "festival" },
    { date: "2026-09-04", name: "Milad-un-Nabi", type: "festival" },
    { date: "2026-10-02", name: "Gandhi Jayanti", type: "national" },
    { date: "2026-10-20", name: "Dussehra", type: "festival" },
    { date: "2026-11-09", name: "Diwali", type: "festival" },
    { date: "2026-11-10", name: "Diwali Holiday", type: "festival" },
    { date: "2026-11-19", name: "Guru Nanak Jayanti", type: "festival" },
    { date: "2026-12-25", name: "Christmas", type: "festival" },
  ]);
  console.log("Seeded holidays");

  console.log("\nSeed completed successfully!");
  console.log("\nLogin credentials:");
  console.log("  HR Admin:  admin@copancs.com / admin123");
  console.log("  Manager:   priya@copancs.com / manager123");
  console.log("  Employee:  aarav@copancs.com / emp123");

  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
