import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { sessions, users, students, teachers } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_EXPIRY = "24h";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken({ userId, timestamp: Date.now() });
  const hashedToken = await hashPassword(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(sessions).values({
    userId,
    token: hashedToken,
    expiresAt,
  });

  return token;
}

export async function validateSession(token: string): Promise<any | null> {
  try {
    const decoded = verifyToken(token);
    const hashedToken = await hashPassword(token);

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, decoded.userId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) return null;

    // Get user with their role-specific data
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        userType: users.userType,
        firstName: users.firstName,
        lastName: users.lastName,
        studentId: students.id,
        teacherId: teachers.id,
      })
      .from(users)
      .leftJoin(students, eq(users.id, students.userId))
      .leftJoin(teachers, eq(users.id, teachers.userId))
      .where(eq(users.id, decoded.userId))
      .limit(1);

    return user;
  } catch (error) {
    return null;
  }
}
