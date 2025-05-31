import { Router } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db";
import { grades, enrollments, classes } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get grades for a student
router.get(
  "/student/:studentId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    // Students can only view their own grades
    if (req.user!.userType === "student" && req.user!.studentId !== studentId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const studentGrades = await db
        .select({
          grade: grades,
          enrollment: enrollments,
          class: classes,
        })
        .from(grades)
        .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(enrollments.studentId, studentId));

      res.json(studentGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ error: "Failed to fetch grades" });
    }
  }
);

// Get grades for a class
router.get(
  "/class/:classId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const classId = parseInt(req.params.classId);

    try {
      // Check if teacher owns the class
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

      const classGrades = await db
        .select({
          grade: grades,
          enrollment: enrollments,
        })
        .from(grades)
        .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
        .where(eq(enrollments.classId, classId));

      res.json(classGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ error: "Failed to fetch grades" });
    }
  }
);

// Create grade (teacher only for their classes)
router.post(
  "/",
  authenticate,
  authorize("teacher", "admin"),
  body("enrollmentId").isInt(),
  body("assignmentName").notEmpty().trim(),
  body("gradeValue").isInt({ min: 2, max: 5 }),
  body("weight").optional().isInt({ min: 0 }),
  body("comments").optional().trim(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { enrollmentId, assignmentName, gradeValue, weight, comments } =
        req.body;

      // Check if teacher owns the class
      const [enrollment] = await db
        .select({
          classId: enrollments.classId,
          teacherId: classes.teacherId,
        })
        .from(enrollments)
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(enrollments.id, enrollmentId))
        .limit(1);

      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      if (
        req.user!.userType === "teacher" &&
        enrollment.teacherId !== req.user!.teacherId
      ) {
        return res
          .status(403)
          .json({ error: "You can only grade students in your classes" });
      }

      const [newGrade] = await db
        .insert(grades)
        .values({
          enrollmentId,
          assignmentName,
          gradeValue,
          weight,
          comments,
          gradedBy: req.user!.teacherId!,
        })
        .returning();

      res.status(201).json(newGrade);
    } catch (error) {
      console.error("Error creating grade:", error);
      res.status(500).json({ error: "Failed to create grade" });
    }
  }
);

// Update grade
router.put(
  "/:id",
  authenticate,
  authorize("teacher", "admin"),
  body("gradeValue").optional().isInt({ min: 0 }),
  body("comments").optional().trim(),
  async (req: AuthRequest, res: Response) => {
    const gradeId = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if teacher owns the grade
      const [gradeData] = await db
        .select({
          grade: grades,
          teacherId: classes.teacherId,
        })
        .from(grades)
        .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(grades.id, gradeId))
        .limit(1);

      if (!gradeData) {
        return res.status(404).json({ error: "Grade not found" });
      }

      if (
        req.user!.userType === "teacher" &&
        gradeData.teacherId !== req.user!.teacherId
      ) {
        return res
          .status(403)
          .json({ error: "You can only update grades in your classes" });
      }

      const updateData: any = { updatedAt: new Date() };
      if (req.body.gradeValue !== undefined)
        updateData.gradeValue = req.body.gradeValue;
      if (req.body.comments !== undefined)
        updateData.comments = req.body.comments;

      const [updatedGrade] = await db
        .update(grades)
        .set(updateData)
        .where(eq(grades.id, gradeId))
        .returning();

      res.json(updatedGrade);
    } catch (error) {
      console.error("Error updating grade:", error);
      res.status(500).json({ error: "Failed to update grade" });
    }
  }
);

// Delete grade (teacher only for their classes)
router.delete(
  "/:id",
  authenticate,
  authorize("teacher", "admin"),
  async (req: AuthRequest, res: Response) => {
    const gradeId = parseInt(req.params.id);

    try {
      // Check if teacher owns the grade
      const [gradeData] = await db
        .select({
          grade: grades,
          teacherId: classes.teacherId,
        })
        .from(grades)
        .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(grades.id, gradeId))
        .limit(1);

      if (!gradeData) {
        return res.status(404).json({ error: "Grade not found" });
      }

      if (
        req.user!.userType === "teacher" &&
        gradeData.teacherId !== req.user!.teacherId
      ) {
        return res
          .status(403)
          .json({ error: "You can only delete grades in your classes" });
      }

      const [deletedGrade] = await db
        .delete(grades)
        .where(eq(grades.id, gradeId))
        .returning();

      res.json({ message: "Grade deleted successfully" });
    } catch (error) {
      console.error("Error deleting grade:", error);
      res.status(500).json({ error: "Failed to delete grade" });
    }
  }
);

export default router;
