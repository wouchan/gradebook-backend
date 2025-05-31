import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import classRoutes from "./routes/classes";
import enrollmentRoutes from "./routes/enrollments";
import gradeRoutes from "./routes/grades";
import studentRoutes from "./routes/students";
import teacherRoutes from "./routes/teachers";
import morgan from "morgan";

const app = express();

// Middleware
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

export default app;
