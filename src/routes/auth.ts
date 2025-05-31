import { Router } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db";
import { users, students, teachers, enrollments } from "../db/schema";
import { hashPassword, verifyPassword, createSession } from "../utils/auth";
import { and, eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Login
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      const token = await createSession(user.id);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// Create user (admin only)
router.post(
  "/register",
  authenticate,
  authorize("admin"),
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().trim(),
  body("firstName").notEmpty().trim(),
  body("lastName").notEmpty().trim(),
  body("userType").isIn(["student", "teacher", "admin"]),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, userType } = req.body;

    try {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Start transaction
      await db.transaction(async (tx) => {
        // Create user
        const [newUser] = await tx
          .insert(users)
          .values({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            userType,
          })
          .returning();

        // Create role-specific record
        if (userType === "student") {
          await tx.insert(students).values({
            userId: newUser.id,
          });
        } else if (userType === "teacher") {
          await tx.insert(teachers).values({
            userId: newUser.id,
          });
        }

        res.status(201).json({
          message: "User created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            userType: newUser.userType,
          },
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// Logout
router.post(
  "/logout",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token && req.user) {
        // In a production system, you would:
        // 1. Delete the session from the database
        // 2. Add the token to a blacklist
        // For now, we'll just return success since the token will expire

        // Optional: Delete the session from database
        // await db.delete(sessions).where(
        //   and(
        //     eq(sessions.userId, req.user.id),
        //     eq(sessions.token, hashedToken)
        //   )
        // );

        res.json({ message: "Logged out successfully" });
      } else {
        res.status(400).json({ error: "No active session" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  }
);

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [userDetails] = await db
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
      .where(eq(users.id, req.user.id))
      .limit(1);

    res.json(userDetails);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Change password
router.post(
  "/change-password",
  authenticate,
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 6 }),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get current user with password
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await verifyPassword(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user.id));

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  }
);

// Refresh token (optional - for token refresh functionality)
router.post(
  "/refresh",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Create new session/token
      const newToken = await createSession(req.user.id);

      res.json({
        token: newToken,
        user: {
          id: req.user.id,
          email: req.user.email,
          userType: req.user.userType,
        },
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  }
);

export default router;
