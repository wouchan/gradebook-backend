import { Router } from "express";
import { db } from "../db";
import { students, users, enrollments, grades, classes } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get all students (admin and teacher)
router.get(
  "/",
  authenticate,
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const allStudents = await db
        .select({
          id: students.id,
          userId: students.userId,
          enrollmentDate: students.enrollmentDate,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id));

      res.json(allStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }
);

// Get student details with grades
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const studentId = parseInt(req.params.id);

  // Students can only view their own details
  if (req.user!.userType === "student" && req.user!.studentId !== studentId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const [student] = await db
      .select({
        id: students.id,
        userId: students.userId,
        enrollmentDate: students.enrollmentDate,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get student's enrollments and grades
    const studentEnrollments = await db
      .select({
        enrollment: enrollments,
        class: classes,
        grades: grades,
      })
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .leftJoin(grades, eq(enrollments.id, grades.enrollmentId))
      .where(eq(enrollments.studentId, studentId));

    res.json({
      ...student,
      enrollments: studentEnrollments,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

export default router;
