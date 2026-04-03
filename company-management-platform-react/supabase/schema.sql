-- =============================================
-- COPAN DIGITAL HR MANAGEMENT - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (supabase.com > SQL Editor)
-- =============================================

-- 1. DEPARTMENTS
CREATE TABLE departments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO departments (name) VALUES
  ('Engineering'), ('Design'), ('Marketing'), ('Sales'), ('HR'), ('Finance'), ('Operations');

-- 2. LOCATIONS
CREATE TABLE locations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO locations (name) VALUES ('Mumbai'), ('Bangalore'), ('Delhi'), ('Pune');

-- 3. ROLES
CREATE TABLE roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT 'var(--primary)',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO roles (name, color, permissions) VALUES
  ('Super Admin', 'var(--danger)', '{"dashboard":"full","employees":"full","attendance":"full","leave":"full","payroll":"full","settings":"full","announcements":"full","teams":"full"}'),
  ('HR Manager', 'var(--primary)', '{"dashboard":"full","employees":"manage","attendance":"manage","leave":"manage","payroll":"manage","settings":"manage","announcements":"manage","teams":"view"}'),
  ('Manager', 'var(--success)', '{"dashboard":"view","employees":"view","attendance":"view","leave":"manage","payroll":"none","settings":"none","announcements":"view","teams":"view"}'),
  ('Employee', 'var(--gray-500)', '{"dashboard":"view","employees":"none","attendance":"view","leave":"view","payroll":"none","settings":"none","announcements":"view","teams":"view"}');

-- 4. EMPLOYEES
CREATE TABLE employees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id BIGINT REFERENCES departments(id),
  designation TEXT,
  location_id BIGINT REFERENCES locations(id),
  join_date DATE,
  dob DATE,
  salary NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'inactive')),
  avatar TEXT,
  manager_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
  role_id BIGINT REFERENCES roles(id),
  payment_mode TEXT DEFAULT 'Bank Transfer',
  bank_name TEXT,
  bank_account TEXT,
  pan TEXT,
  uan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ATTENDANCE
CREATE TABLE attendance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'on-leave', 'half-day', 'holiday', 'weekend')),
  hours NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- 6. LEAVE POLICY
CREATE TABLE leave_policies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  total_days NUMERIC(5,1) DEFAULT 0,
  unit TEXT DEFAULT 'days' CHECK (unit IN ('days', 'as earned')),
  carry_forward BOOLEAN DEFAULT false,
  carry_forward_max INT DEFAULT 0,
  encashable BOOLEAN DEFAULT false,
  accrual TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO leave_policies (type, total_days, unit, carry_forward, carry_forward_max, encashable, accrual) VALUES
  ('Casual Leave', 12, 'days', false, 0, false, 'Credited at start of year'),
  ('Sick Leave', 7, 'days', false, 0, false, 'Credited at start of year'),
  ('Earned Leave', 18, 'days', true, 10, true, '1.5 days per month'),
  ('Comp Off', 0, 'as earned', false, 0, false, 'As earned'),
  ('Maternity Leave', 182, 'days', false, 0, false, 'As applicable'),
  ('Paternity Leave', 15, 'days', false, 0, false, 'As applicable');

-- 7. LEAVE BALANCES
CREATE TABLE leave_balances (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_policy_id BIGINT NOT NULL REFERENCES leave_policies(id) ON DELETE CASCADE,
  balance NUMERIC(5,1) DEFAULT 0,
  used NUMERIC(5,1) DEFAULT 0,
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, leave_policy_id, year)
);

-- 8. LEAVE REQUESTS
CREATE TABLE leave_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_policy_id BIGINT NOT NULL REFERENCES leave_policies(id),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  days NUMERIC(4,1) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by BIGINT REFERENCES employees(id),
  reviewed_at TIMESTAMPTZ,
  applied_on TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PAYROLL
CREATE TABLE payroll (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INT NOT NULL,
  total_calendar_days INT,
  weekends INT,
  holidays INT,
  total_working_days INT,
  present_days NUMERIC(4,1),
  paid_leave_days NUMERIC(4,1) DEFAULT 0,
  unpaid_leave_days NUMERIC(4,1) DEFAULT 0,
  late_days INT DEFAULT 0,
  late_deduction_days NUMERIC(4,1) DEFAULT 0,
  half_days INT DEFAULT 0,
  payable_days NUMERIC(4,1),
  ctc NUMERIC(12,2),
  basic NUMERIC(12,2),
  hra NUMERIC(12,2),
  special_allowance NUMERIC(12,2),
  conveyance NUMERIC(12,2),
  medical NUMERIC(12,2),
  gross_earnings NUMERIC(12,2),
  pf_employee NUMERIC(12,2),
  pf_employer NUMERIC(12,2),
  professional_tax NUMERIC(12,2),
  tds NUMERIC(12,2),
  lop_deduction NUMERIC(12,2),
  total_deductions NUMERIC(12,2),
  net_pay NUMERIC(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
  paid_on DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- 10. ANNOUNCEMENTS
CREATE TABLE announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'event', 'policy', 'celebration', 'urgent')),
  author_id BIGINT REFERENCES employees(id),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. TEAMS
CREATE TABLE teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  manager_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(team_id, employee_id)
);

-- 12. HOLIDAYS
CREATE TABLE holidays (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'national' CHECK (type IN ('national', 'festival', 'company')),
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO holidays (date, name, type) VALUES
  ('2026-01-26', 'Republic Day', 'national'),
  ('2026-03-10', 'Holi', 'festival'),
  ('2026-03-30', 'Id-ul-Fitr', 'festival'),
  ('2026-04-06', 'Ram Navami', 'festival'),
  ('2026-04-14', 'Ambedkar Jayanti', 'national'),
  ('2026-04-18', 'Good Friday', 'festival'),
  ('2026-05-01', 'May Day', 'national'),
  ('2026-06-06', 'Id-ul-Zuha (Bakrid)', 'festival'),
  ('2026-07-06', 'Muharram', 'festival'),
  ('2026-08-15', 'Independence Day', 'national'),
  ('2026-08-25', 'Janmashtami', 'festival'),
  ('2026-09-04', 'Milad-un-Nabi', 'festival'),
  ('2026-10-02', 'Gandhi Jayanti', 'national'),
  ('2026-10-20', 'Dussehra', 'festival'),
  ('2026-11-09', 'Diwali', 'festival'),
  ('2026-11-10', 'Diwali Holiday', 'festival'),
  ('2026-11-19', 'Guru Nanak Jayanti', 'festival'),
  ('2026-12-25', 'Christmas', 'festival');

-- 13. NOTIFICATIONS
CREATE TABLE notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  icon TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. COMPANY SETTINGS (single-row config table)
CREATE TABLE company_settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT DEFAULT 'Copan',
  industry TEXT DEFAULT 'Technology',
  company_size TEXT DEFAULT '50-100',
  founded_year INT DEFAULT 2019,
  email TEXT,
  phone TEXT,
  address TEXT,
  pay_cycle TEXT DEFAULT 'monthly',
  pay_day TEXT DEFAULT '28th',
  currency TEXT DEFAULT 'INR',
  financial_year TEXT DEFAULT 'April-March',
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO company_settings (name, email, phone, address) VALUES
  ('Copan', 'hr@copan.com', '+91 98765 00000', 'Flat Number 5, 3rd Floor, Hibiscus Park, Sector 25, Panchkula, Haryana 134116');

-- 15. NOTIFICATION PREFERENCES
CREATE TABLE notification_preferences (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  email BOOLEAN DEFAULT true,
  push BOOLEAN DEFAULT true,
  UNIQUE(employee_id, event_type)
);


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all reference tables
CREATE POLICY "Authenticated users can read departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read locations" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read leave_policies" ON leave_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read holidays" ON holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read company_settings" ON company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read teams" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read team_members" ON team_members FOR SELECT TO authenticated USING (true);

-- Employees: everyone can read, only admins can write
CREATE POLICY "Authenticated users can read employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employees" ON employees FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );
CREATE POLICY "Admins can update employees" ON employees FOR UPDATE TO authenticated
  USING (
    auth_user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );

-- Attendance: own records or admin
CREATE POLICY "Read own or admin attendance" ON attendance FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager', 'Manager'))
  );
CREATE POLICY "Insert own attendance" ON attendance FOR INSERT TO authenticated
  WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );
CREATE POLICY "Update own or admin attendance" ON attendance FOR UPDATE TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );

-- Leave requests: own records or admin/manager
CREATE POLICY "Read own or admin leave_requests" ON leave_requests FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager', 'Manager'))
  );
CREATE POLICY "Insert own leave_requests" ON leave_requests FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin can update leave_requests" ON leave_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager', 'Manager'))
  );

-- Leave balances: own or admin
CREATE POLICY "Read own or admin leave_balances" ON leave_balances FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );
CREATE POLICY "Admin can manage leave_balances" ON leave_balances FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );

-- Payroll: own or admin
CREATE POLICY "Read own or admin payroll" ON payroll FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );
CREATE POLICY "Admin can manage payroll" ON payroll FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager'))
  );

-- Notifications: own only
CREATE POLICY "Read own notifications" ON notifications FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()));
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()));

-- Notification preferences: own only
CREATE POLICY "Manage own notification_preferences" ON notification_preferences FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()));

-- Admin-only write access for config tables
CREATE POLICY "Admin can manage roles" ON roles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name = 'Super Admin'));
CREATE POLICY "Admin can manage leave_policies" ON leave_policies FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager')));
CREATE POLICY "Admin can manage holidays" ON holidays FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager')));
CREATE POLICY "Admin can manage company_settings" ON company_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager')));
CREATE POLICY "Admin can manage announcements" ON announcements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager')));
CREATE POLICY "Admin can manage departments" ON departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager')));
CREATE POLICY "Admin can manage locations" ON locations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.auth_user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Manager')));


-- =============================================
-- HELPER FUNCTION: auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================
-- SEED DATA: Sample employees
-- =============================================
-- NOTE: Run this AFTER creating auth users, or without auth_user_id for now

INSERT INTO employees (employee_id, name, email, phone, department_id, designation, location_id, join_date, dob, salary, status, avatar, role_id, payment_mode, bank_name, bank_account, pan, uan) VALUES
  ('CD-1001', 'Aarav Sharma', 'aarav.sharma@copan.com', '+91 98765 43210', 1, 'Senior Developer', 2, '2022-03-15', '1995-04-02', 120000, 'active', 'AS', 4, 'Bank Transfer', 'HDFC Bank', '50100234567890', 'ABCPS1234K', '100872318891'),
  ('CD-1002', 'Priya Patel', 'priya.patel@copan.com', '+91 98765 43211', 1, 'Engineering Manager', 2, '2020-01-10', '1990-07-22', 180000, 'active', 'PP', 3, 'Bank Transfer', 'ICICI Bank', '60210345678901', 'BXYPP2345L', '100872318892'),
  ('CD-1003', 'Rajesh Kumar', 'rajesh.kumar@copan.com', '+91 98765 43212', 1, 'VP Engineering', 1, '2019-06-01', '1985-12-10', 250000, 'active', 'RK', 1, 'Bank Transfer', 'SBI', '38210456789012', 'CKLRK3456M', '100872318893'),
  ('CD-1004', 'Sneha Reddy', 'sneha.reddy@copan.com', '+91 98765 43213', 2, 'UI/UX Lead', 2, '2021-08-20', '1993-04-05', 140000, 'active', 'SR', 3, 'Bank Transfer', 'Axis Bank', '91720567890123', 'DMPSR4567N', '100872318894'),
  ('CD-1005', 'Amit Verma', 'amit.verma@copan.com', '+91 98765 43214', 3, 'Marketing Manager', 1, '2021-02-14', '1992-09-18', 130000, 'active', 'AV', 3, 'Bank Transfer', 'Kotak Mahindra Bank', '41530678901234', 'EQRAV5678P', '100872318895'),
  ('CD-1006', 'Kavya Nair', 'kavya.nair@copan.com', '+91 98765 43215', 5, 'HR Manager', 1, '2020-11-05', '1991-04-03', 110000, 'active', 'KN', 2, 'Bank Transfer', 'IndusInd Bank', '20140789012345', 'FNBKN6789Q', '100872318896'),
  ('CD-1007', 'Vikram Singh', 'vikram.singh@copan.com', '+91 98765 43216', 4, 'Sales Lead', 3, '2022-07-18', '1994-01-30', 125000, 'active', 'VS', 4, 'Bank Transfer', 'Punjab National Bank', '32450890123456', 'GPSVS7890R', '100872318897'),
  ('CD-1008', 'Ananya Gupta', 'ananya.gupta@copan.com', '+91 98765 43217', 1, 'Frontend Developer', 2, '2023-01-09', '1998-06-14', 90000, 'active', 'AG', 4, 'Bank Transfer', 'HDFC Bank', '50100901234567', 'HQTAG8901S', '100872318898'),
  ('CD-1009', 'Rohan Mehta', 'rohan.mehta@copan.com', '+91 98765 43218', 6, 'Finance Analyst', 1, '2022-09-12', '1996-11-25', 95000, 'active', 'RM', 4, 'Bank Transfer', 'ICICI Bank', '60211012345678', 'IRWRM9012T', '100872318899'),
  ('CD-1010', 'Deepa Iyer', 'deepa.iyer@copan.com', '+91 98765 43219', 1, 'Backend Developer', 4, '2023-04-03', '1997-04-07', 95000, 'on-leave', 'DI', 4, 'Bank Transfer', 'SBI', '38211123456789', 'JSXDI0123U', '100872318900'),
  ('CD-1011', 'Arjun Rao', 'arjun.rao@copan.com', '+91 98765 43220', 7, 'Ops Manager', 3, '2021-05-22', '1993-08-09', 115000, 'active', 'AR', 3, 'Bank Transfer', 'Axis Bank', '91721234567890', 'KTYAR1234V', '100872318901'),
  ('CD-1012', 'Meera Joshi', 'meera.joshi@copan.com', '+91 98765 43221', 2, 'Graphic Designer', 4, '2023-06-15', '1999-04-02', 75000, 'active', 'MJ', 4, 'Bank Transfer', 'Kotak Mahindra Bank', '41531345678901', 'LWZMJ2345W', '100872318902');

-- Set manager relationships
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1002') WHERE employee_id = 'CD-1001';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1003') WHERE employee_id = 'CD-1002';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1003') WHERE employee_id = 'CD-1004';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1003') WHERE employee_id = 'CD-1005';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1003') WHERE employee_id = 'CD-1006';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1005') WHERE employee_id = 'CD-1007';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1002') WHERE employee_id = 'CD-1008';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1003') WHERE employee_id = 'CD-1009';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1002') WHERE employee_id = 'CD-1010';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1003') WHERE employee_id = 'CD-1011';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'CD-1004') WHERE employee_id = 'CD-1012';

-- Seed announcements
INSERT INTO announcements (title, message, category, author_id, date) VALUES
  ('Annual Company Offsite', 'Our annual offsite is scheduled for April 25-27 in Goa. Details to follow.', 'event', (SELECT id FROM employees WHERE employee_id = 'CD-1006'), '2026-04-01'),
  ('New Health Insurance Policy', 'We have upgraded our health insurance coverage. Check your email for details.', 'policy', (SELECT id FROM employees WHERE employee_id = 'CD-1006'), '2026-03-28'),
  ('Q1 Town Hall', 'Q1 results town hall on April 5th at 3 PM. All hands mandatory.', 'general', (SELECT id FROM employees WHERE employee_id = 'CD-1003'), '2026-03-25');
