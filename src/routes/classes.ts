import { Router } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db";
import { classes, enrollments, teachers } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get all classes
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let query = db.select().from(classes);

    // If teacher, only show their classes
    if (req.user!.userType === "teacher") {
      query = query.where(eq(classes.teacherId, req.user!.teacherId!));
    }

    const allClasses = await query;
    res.json(allClasses);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Get class by ID
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const classId = parseInt(req.params.id);

  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Check authorization for teachers
    if (
      req.user!.userType === "teacher" &&
      classData.teacherId !== req.user!.teacherId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(classData);
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

// Create class (admin and teacher)
router.post(
  "/",
  authenticate,
  authorize("admin", "teacher"),
  body("name").notEmpty().trim(),
  body("code").notEmpty().trim(),
  body("description").optional().trim(),
  body("teacherId").optional().isInt(),
  body("academicYear").notEmpty().trim(),
  body("semester").notEmpty().trim(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, code, description, teacherId, academicYear, semester } =
        req.body;

      // If teacher is creating, use their ID
      const finalTeacherId =
        req.user!.userType === "teacher" ? req.user!.teacherId! : teacherId;

      if (!finalTeacherId) {
        return res.status(400).json({ error: "Teacher ID is required" });
      }

      const [newClass] = await db
        .insert(classes)
        .values({
          name,
          code,
          description,
          teacherId: finalTeacherId,
          academicYear,
          semester,
        })
        .returning();

      res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ error: "Failed to create class" });
    }
  }
);

// Update class
router.put(
  "/:id",
  authenticate,
  body("name").optional().trim(),
  body("description").optional().trim(),
  body("isActive").optional().isBoolean(),
  async (req: AuthRequest, res: Response) => {
    const classId = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check authorization
      const [classData] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      if (
        req.user!.userType === "teacher" &&
        classData.teacherId !== req.user!.teacherId
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updateData: any = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined)
        updateData.description = req.body.description;
      if (req.body.isActive !== undefined)
        updateData.isActive = req.body.isActive;

      const [updatedClass] = await db
        .update(classes)
        .set(updateData)
        .where(eq(classes.id, classId))
        .returning();

      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ error: "Failed to update class" });
    }
  }
);

// Delete class (admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  const classId = parseInt(req.params.id);

  try {
    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, classId))
      .returning();

    if (!deletedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ error: "Failed to delete class" });
  }
});

// Get class enrollments
router.get(
  "/:id/enrollments",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const classId = parseInt(req.params.id);

    try {
      // Check authorization
      const [classData] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      if (
        req.user!.userType === "teacher" &&
        classData.teacherId !== req.user!.teacherId
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const classEnrollments = await db
        .select()
        .from(enrollments)
        .where(eq(enrollments.classId, classId));

      res.json(classEnrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  }
);

export default router;
