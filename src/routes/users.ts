import { Router } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db";
import { users, students, teachers } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: users.userType,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users);

    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);

  // Users can only view their own profile unless they're admin
  if (req.user!.userType !== "admin" && req.user!.id !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: users.userType,
        isActive: users.isActive,
        createdAt: users.createdAt,
        studentData: students,
        teacherData: teachers,
      })
      .from(users)
      .leftJoin(students, eq(users.id, students.userId))
      .leftJoin(teachers, eq(users.id, teachers.userId))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user
router.put(
  "/:id",
  authenticate,
  body("firstName").optional().trim(),
  body("lastName").optional().trim(),
  body("isActive").optional().isBoolean(),
  async (req: AuthRequest, res: Response) => {
    const userId = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Users can only update their own profile unless they're admin
    if (req.user!.userType !== "admin" && req.user!.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const updateData: any = { updatedAt: new Date() };

      if (req.body.firstName !== undefined)
        updateData.firstName = req.body.firstName;
      if (req.body.lastName !== undefined)
        updateData.lastName = req.body.lastName;

      // Only admin can change isActive status
      if (req.user!.userType === "admin" && req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive;
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userType: updatedUser.userType,
        isActive: updatedUser.isActive,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

// Delete user (admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
