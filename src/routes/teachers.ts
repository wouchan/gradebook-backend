import { Router } from "express";
import { db } from "../db";
import { teachers, users, classes } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Get all teachers (admin only)
router.get(
  "/",
  authenticate,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const allTeachers = await db
        .select({
          id: teachers.id,
          userId: teachers.userId,
          hireDate: teachers.hireDate,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id));

      res.json(allTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ error: "Failed to fetch teachers" });
    }
  }
);

// Get teacher with their classes
router.get(
  "/:id",
  authenticate,
  authorize("teacher", "admin"),
  async (req, res) => {
    const teacherId = parseInt(req.params.id);

    try {
      const [teacher] = await db
        .select({
          id: teachers.id,
          userId: teachers.userId,
          hireDate: teachers.hireDate,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id))
        .where(eq(teachers.id, teacherId))
        .limit(1);

      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Get teacher's classes
      const teacherClasses = await db
        .select()
        .from(classes)
        .where(eq(classes.teacherId, teacherId));

      res.json({
        ...teacher,
        classes: teacherClasses,
      });
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ error: "Failed to fetch teacher" });
    }
  }
);

export default router;
