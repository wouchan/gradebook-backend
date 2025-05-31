import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db";
import { enrollments, classes, students, users, grades } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get all enrollments (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const allEnrollments = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        classId: enrollments.classId,
        enrollmentDate: enrollments.enrollmentDate,
        isActive: enrollments.isActive,
        studentName: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
        className: classes.name,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(enrollments.classId, classes.id));

    res.json(allEnrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// Get enrollment by ID
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const enrollmentId = parseInt(req.params.id);

  try {
    const [enrollment] = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        classId: enrollments.classId,
        enrollmentDate: enrollments.enrollmentDate,
        isActive: enrollments.isActive,
        student: {
          id: students.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        class: classes,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .where(eq(enrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Check authorization
    if (
      req.user!.userType === "student" &&
      enrollment.studentId !== req.user!.studentId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    } else if (req.user!.userType === "teacher") {
      // Check if teacher owns the class
      if (enrollment.class.teacherId !== req.user!.teacherId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    res.json(enrollment);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res.status(500).json({ error: "Failed to fetch enrollment" });
  }
});

// Get enrollments for a specific student
router.get(
  "/student/:studentId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    // Check authorization
    if (req.user!.userType === "student" && req.user!.studentId !== studentId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const studentEnrollments = await db
        .select({
          id: enrollments.id,
          enrollmentDate: enrollments.enrollmentDate,
          isActive: enrollments.isActive,
          class: {
            id: classes.id,
            name: classes.name,
          },
        })
        .from(enrollments)
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(enrollments.studentId, studentId));

      res.json(studentEnrollments);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      res.status(500).json({ error: "Failed to fetch student enrollments" });
    }
  }
);

// Create enrollment (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  body("studentId").isInt(),
  body("classId").isInt(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { studentId, classId } = req.body;

      // Verify student exists
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Verify class exists and is active
      const [classData] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      if (!classData.isActive) {
        return res
          .status(400)
          .json({ error: "Cannot enroll in inactive class" });
      }

      // Check if enrollment already exists
      const [existingEnrollment] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.classId, classId)
          )
        )
        .limit(1);

      if (existingEnrollment) {
        if (existingEnrollment.isActive) {
          return res
            .status(409)
            .json({ error: "Student already enrolled in this class" });
        } else {
          // Reactivate existing enrollment
          const [reactivated] = await db
            .update(enrollments)
            .set({
              isActive: true,
              enrollmentDate: new Date(),
            })
            .where(eq(enrollments.id, existingEnrollment.id))
            .returning();

          return res.json({
            message: "Enrollment reactivated",
            enrollment: reactivated,
          });
        }
      }

      // Create new enrollment
      const [newEnrollment] = await db
        .insert(enrollments)
        .values({
          studentId,
          classId,
        })
        .returning();

      // Fetch complete enrollment details
      const [enrollmentDetails] = await db
        .select({
          id: enrollments.id,
          enrollmentDate: enrollments.enrollmentDate,
          isActive: enrollments.isActive,
          student: {
            firstName: users.firstName,
            lastName: users.lastName,
          },
          class: {
            name: classes.name,
          },
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(enrollments.id, newEnrollment.id))
        .limit(1);

      res.status(201).json(enrollmentDetails);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ error: "Failed to create enrollment" });
    }
  }
);

// Bulk enroll students (admin only)
router.post(
  "/bulk",
  authenticate,
  authorize("admin"),
  body("classId").isInt(),
  body("studentIds").isArray(),
  body("studentIds.*").isInt(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { classId, studentIds } = req.body;

      // Verify class exists and is active
      const [classData] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      if (!classData.isActive) {
        return res
          .status(400)
          .json({ error: "Cannot enroll in inactive class" });
      }

      const results = {
        successful: [] as any[],
        failed: [] as any[],
        alreadyEnrolled: [] as any[],
      };

      // Process each student
      for (const studentId of studentIds) {
        try {
          // Check if student exists
          const [student] = await db
            .select()
            .from(students)
            .where(eq(students.id, studentId))
            .limit(1);

          if (!student) {
            results.failed.push({ studentId, reason: "Student not found" });
            continue;
          }

          // Check existing enrollment
          const [existingEnrollment] = await db
            .select()
            .from(enrollments)
            .where(
              and(
                eq(enrollments.studentId, studentId),
                eq(enrollments.classId, classId)
              )
            )
            .limit(1);

          if (existingEnrollment && existingEnrollment.isActive) {
            results.alreadyEnrolled.push({ studentId });
            continue;
          }

          if (existingEnrollment && !existingEnrollment.isActive) {
            // Reactivate
            await db
              .update(enrollments)
              .set({ isActive: true, enrollmentDate: new Date() })
              .where(eq(enrollments.id, existingEnrollment.id));
            results.successful.push({ studentId, action: "reactivated" });
          } else {
            // Create new
            await db.insert(enrollments).values({ studentId, classId });
            results.successful.push({ studentId, action: "created" });
          }
        } catch (error) {
          results.failed.push({ studentId, reason: "Database error" });
        }
      }

      res.json({
        message: "Bulk enrollment completed",
        results,
      });
    } catch (error) {
      console.error("Error in bulk enrollment:", error);
      res.status(500).json({ error: "Failed to process bulk enrollment" });
    }
  }
);

// Update enrollment (admin only - mainly for deactivating)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  body("isActive").isBoolean(),
  async (req: AuthRequest, res: Response) => {
    const enrollmentId = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { isActive } = req.body;

      const [updatedEnrollment] = await db
        .update(enrollments)
        .set({ isActive })
        .where(eq(enrollments.id, enrollmentId))
        .returning();

      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json(updatedEnrollment);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ error: "Failed to update enrollment" });
    }
  }
);

// Delete enrollment (admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  const enrollmentId = parseInt(req.params.id);

  try {
    // Check if there are grades associated with this enrollment
    const [existingGrades] = await db
      .select()
      .from(grades)
      .where(eq(grades.enrollmentId, enrollmentId))
      .limit(1);

    if (existingGrades) {
      return res.status(400).json({
        error:
          "Cannot delete enrollment with existing grades. Consider deactivating instead.",
      });
    }

    const [deletedEnrollment] = await db
      .delete(enrollments)
      .where(eq(enrollments.id, enrollmentId))
      .returning();

    if (!deletedEnrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    res.status(500).json({ error: "Failed to delete enrollment" });
  }
});

// Get enrollment statistics for a class
router.get(
  "/class/:classId/stats",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const classId = parseInt(req.params.classId);

    try {
      // Check authorization for teachers
      if (req.user!.userType === "teacher") {
        const [classData] = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);

        if (!classData || classData.teacherId !== req.user!.teacherId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      // Get enrollment statistics
      const activeEnrollments = await db
        .select({
          total: students.id,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(
          and(eq(enrollments.classId, classId), eq(enrollments.isActive, true))
        );

      const inactiveEnrollments = await db
        .select({
          total: students.id,
        })
        .from(enrollments)
        .where(
          and(eq(enrollments.classId, classId), eq(enrollments.isActive, false))
        );

      res.json({
        classId,
        activeStudents: activeEnrollments.length,
        inactiveStudents: inactiveEnrollments.length,
        totalStudents: activeEnrollments.length + inactiveEnrollments.length,
      });
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      res.status(500).json({ error: "Failed to fetch enrollment statistics" });
    }
  }
);

export default router;
