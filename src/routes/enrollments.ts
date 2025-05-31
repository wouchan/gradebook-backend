import { Router } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db";
import { enrollments, classes, students } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get all enrollments (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const allEnrollments = await db.select().from(enrollments);
    res.json(allEnrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});
