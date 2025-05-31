export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
    userType: "student" | "teacher" | "admin";
    studentId?: number;
    teacherId?: number;
  };
}
