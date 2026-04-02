require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/holidays", require("./routes/holidayRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/regularization", require("./routes/regularizationRoutes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
