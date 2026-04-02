// Mock data for the company management platform

const COMPANY = {
    name: "TechNova Solutions",
    logo: "TN",
    departments: ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"],
    locations: ["Mumbai", "Bangalore", "Delhi", "Pune"]
};

const EMPLOYEES = [
    { id: 1, name: "Aarav Sharma", email: "aarav.sharma@technova.com", phone: "+91 98765 43210", department: "Engineering", designation: "Senior Developer", location: "Bangalore", joinDate: "2022-03-15", salary: 120000, status: "active", avatar: "AS", manager: "Priya Patel", employeeId: "TN-1001" },
    { id: 2, name: "Priya Patel", email: "priya.patel@technova.com", phone: "+91 98765 43211", department: "Engineering", designation: "Engineering Manager", location: "Bangalore", joinDate: "2020-01-10", salary: 180000, status: "active", avatar: "PP", manager: "Rajesh Kumar", employeeId: "TN-1002" },
    { id: 3, name: "Rajesh Kumar", email: "rajesh.kumar@technova.com", phone: "+91 98765 43212", department: "Engineering", designation: "VP Engineering", location: "Mumbai", joinDate: "2019-06-01", salary: 250000, status: "active", avatar: "RK", manager: null, employeeId: "TN-1003" },
    { id: 4, name: "Sneha Reddy", email: "sneha.reddy@technova.com", phone: "+91 98765 43213", department: "Design", designation: "UI/UX Lead", location: "Bangalore", joinDate: "2021-08-20", salary: 140000, status: "active", avatar: "SR", manager: "Rajesh Kumar", employeeId: "TN-1004" },
    { id: 5, name: "Amit Verma", email: "amit.verma@technova.com", phone: "+91 98765 43214", department: "Marketing", designation: "Marketing Manager", location: "Mumbai", joinDate: "2021-02-14", salary: 130000, status: "active", avatar: "AV", manager: "Rajesh Kumar", employeeId: "TN-1005" },
    { id: 6, name: "Kavya Nair", email: "kavya.nair@technova.com", phone: "+91 98765 43215", department: "HR", designation: "HR Manager", location: "Mumbai", joinDate: "2020-11-05", salary: 110000, status: "active", avatar: "KN", manager: "Rajesh Kumar", employeeId: "TN-1006" },
    { id: 7, name: "Vikram Singh", email: "vikram.singh@technova.com", phone: "+91 98765 43216", department: "Sales", designation: "Sales Lead", location: "Delhi", joinDate: "2022-07-18", salary: 125000, status: "active", avatar: "VS", manager: "Amit Verma", employeeId: "TN-1007" },
    { id: 8, name: "Ananya Gupta", email: "ananya.gupta@technova.com", phone: "+91 98765 43217", department: "Engineering", designation: "Frontend Developer", location: "Bangalore", joinDate: "2023-01-09", salary: 90000, status: "active", avatar: "AG", manager: "Priya Patel", employeeId: "TN-1008" },
    { id: 9, name: "Rohan Mehta", email: "rohan.mehta@technova.com", phone: "+91 98765 43218", department: "Finance", designation: "Finance Analyst", location: "Mumbai", joinDate: "2022-09-12", salary: 95000, status: "active", avatar: "RM", manager: "Rajesh Kumar", employeeId: "TN-1009" },
    { id: 10, name: "Deepa Iyer", email: "deepa.iyer@technova.com", phone: "+91 98765 43219", department: "Engineering", designation: "Backend Developer", location: "Pune", joinDate: "2023-04-03", salary: 95000, status: "on-leave", avatar: "DI", manager: "Priya Patel", employeeId: "TN-1010" },
    { id: 11, name: "Arjun Rao", email: "arjun.rao@technova.com", phone: "+91 98765 43220", department: "Operations", designation: "Ops Manager", location: "Delhi", joinDate: "2021-05-22", salary: 115000, status: "active", avatar: "AR", manager: "Rajesh Kumar", employeeId: "TN-1011" },
    { id: 12, name: "Meera Joshi", email: "meera.joshi@technova.com", phone: "+91 98765 43221", department: "Design", designation: "Graphic Designer", location: "Pune", joinDate: "2023-06-15", salary: 75000, status: "active", avatar: "MJ", manager: "Sneha Reddy", employeeId: "TN-1012" }
];

const ATTENDANCE_LOG = [
    { employeeId: 1, date: "2026-04-01", clockIn: "09:05", clockOut: "18:30", status: "present", hours: 9.4 },
    { employeeId: 1, date: "2026-04-02", clockIn: "09:00", clockOut: null, status: "present", hours: null },
    { employeeId: 2, date: "2026-04-01", clockIn: "08:45", clockOut: "18:15", status: "present", hours: 9.5 },
    { employeeId: 2, date: "2026-04-02", clockIn: "08:50", clockOut: null, status: "present", hours: null },
    { employeeId: 3, date: "2026-04-01", clockIn: "10:00", clockOut: "19:00", status: "present", hours: 9.0 },
    { employeeId: 4, date: "2026-04-01", clockIn: "09:30", clockOut: "18:00", status: "present", hours: 8.5 },
    { employeeId: 5, date: "2026-04-01", clockIn: null, clockOut: null, status: "absent", hours: 0 },
    { employeeId: 6, date: "2026-04-01", clockIn: "09:15", clockOut: "17:45", status: "present", hours: 8.5 },
    { employeeId: 7, date: "2026-04-01", clockIn: "09:00", clockOut: "18:00", status: "present", hours: 9.0 },
    { employeeId: 8, date: "2026-04-01", clockIn: "09:10", clockOut: "18:20", status: "present", hours: 9.2 },
    { employeeId: 10, date: "2026-04-01", clockIn: null, clockOut: null, status: "on-leave", hours: 0 },
];

const LEAVE_REQUESTS = [
    { id: 1, employeeId: 10, employeeName: "Deepa Iyer", type: "Sick Leave", from: "2026-03-30", to: "2026-04-03", days: 5, reason: "Medical procedure", status: "approved", appliedOn: "2026-03-25" },
    { id: 2, employeeId: 1, employeeName: "Aarav Sharma", type: "Casual Leave", from: "2026-04-10", to: "2026-04-11", days: 2, reason: "Personal work", status: "pending", appliedOn: "2026-04-01" },
    { id: 3, employeeId: 5, employeeName: "Amit Verma", type: "Earned Leave", from: "2026-04-15", to: "2026-04-20", days: 5, reason: "Family vacation", status: "pending", appliedOn: "2026-04-01" },
    { id: 4, employeeId: 8, employeeName: "Ananya Gupta", type: "Sick Leave", from: "2026-03-20", to: "2026-03-21", days: 2, reason: "Fever", status: "approved", appliedOn: "2026-03-19" },
    { id: 5, employeeId: 7, employeeName: "Vikram Singh", type: "Casual Leave", from: "2026-03-28", to: "2026-03-28", days: 1, reason: "Personal errand", status: "rejected", appliedOn: "2026-03-26" },
];

const LEAVE_BALANCE = [
    { employeeId: 1, casual: 8, sick: 6, earned: 12, compOff: 1 },
    { employeeId: 2, casual: 10, sick: 7, earned: 15, compOff: 0 },
    { employeeId: 3, casual: 10, sick: 7, earned: 18, compOff: 2 },
    { employeeId: 4, casual: 9, sick: 5, earned: 10, compOff: 0 },
    { employeeId: 5, casual: 7, sick: 7, earned: 8, compOff: 1 },
    { employeeId: 8, casual: 10, sick: 5, earned: 6, compOff: 0 },
    { employeeId: 10, casual: 6, sick: 2, earned: 10, compOff: 0 },
];

const PAYROLL_DATA = [
    { employeeId: 1, month: "March 2026", basic: 60000, hra: 24000, allowances: 12000, deductions: 8500, tax: 7500, netPay: 80000, status: "paid", paidOn: "2026-03-28" },
    { employeeId: 2, month: "March 2026", basic: 90000, hra: 36000, allowances: 18000, deductions: 12000, tax: 15000, netPay: 117000, status: "paid", paidOn: "2026-03-28" },
    { employeeId: 3, month: "March 2026", basic: 125000, hra: 50000, allowances: 25000, deductions: 18000, tax: 25000, netPay: 157000, status: "paid", paidOn: "2026-03-28" },
    { employeeId: 4, month: "March 2026", basic: 70000, hra: 28000, allowances: 14000, deductions: 9500, tax: 9000, netPay: 93500, status: "paid", paidOn: "2026-03-28" },
    { employeeId: 5, month: "March 2026", basic: 65000, hra: 26000, allowances: 13000, deductions: 9000, tax: 8500, netPay: 86500, status: "paid", paidOn: "2026-03-28" },
];

const ANNOUNCEMENTS = [
    { id: 1, title: "Annual Company Offsite", message: "Our annual offsite is scheduled for April 25-27 in Goa. Details to follow.", date: "2026-04-01", author: "Kavya Nair" },
    { id: 2, title: "New Health Insurance Policy", message: "We've upgraded our health insurance coverage. Check your email for details.", date: "2026-03-28", author: "Kavya Nair" },
    { id: 3, title: "Q1 Town Hall", message: "Q1 results town hall on April 5th at 3 PM. All hands mandatory.", date: "2026-03-25", author: "Rajesh Kumar" },
];

const NOTIFICATIONS = [
    { id: 1, type: 'leave', icon: 'fa-calendar-alt', title: 'Leave Request', message: 'Aarav Sharma applied for 2 days casual leave', time: '10 min ago', read: false },
    { id: 2, type: 'leave', icon: 'fa-calendar-alt', title: 'Leave Request', message: 'Amit Verma applied for 5 days earned leave', time: '1 hour ago', read: false },
    { id: 3, type: 'announcement', icon: 'fa-bullhorn', title: 'New Announcement', message: 'Annual Company Offsite scheduled for April 25-27', time: '3 hours ago', read: false },
    { id: 4, type: 'payroll', icon: 'fa-wallet', title: 'Payroll Processed', message: 'March 2026 payroll has been completed', time: '2 days ago', read: true },
    { id: 5, type: 'employee', icon: 'fa-user-plus', title: 'New Employee', message: 'Meera Joshi has joined the Design team', time: '3 days ago', read: true },
    { id: 6, type: 'attendance', icon: 'fa-clock', title: 'Attendance Alert', message: 'Amit Verma was absent yesterday without leave', time: '1 day ago', read: false },
];

const CURRENT_USER = {
    id: 6,
    name: "Kavya Nair",
    email: "kavya.nair@technova.com",
    role: "HR Manager",
    avatar: "KN",
    isAdmin: true
};
