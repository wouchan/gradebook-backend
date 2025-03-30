import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { students } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerStudentRoutes(router: Router) {
  router.get("/students", async (ctx) => {
    try {
      const allStudents = await db.select().from(students);
      ctx.response.body = allStudents;
    } catch (err) {
      console.log("Database error: ", err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch students" };
    }
  });

  router.get("/students/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const student = await db
        .select()
        .from(students)
        .where(eq(students.id, parseInt(id)))
        .limit(1);

      if (student.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Student not found" };
      } else {
        ctx.response.body = student[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch student" };
    }
  });

  router.post("/students", async (ctx) => {
    const { name, email, classId } = await ctx.request.body.json() as {
      name: string;
      email: string;
      classId: number;
    };

    try {
      const newStudent = await db
        .insert(students)
        .values({
          name,
          email,
          classId,
        })
        .returning();

      ctx.response.body = newStudent[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create student" };
    }
  });

  router.put("/students/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };
    const { name, email, classId } = await ctx.request.body.json() as {
      name: string;
      email: string;
      classId: number;
    };

    try {
      const updatedStudent = await db
        .update(students)
        .set({ name, email, classId })
        .where(eq(students.id, parseInt(id)))
        .returning();

      if (updatedStudent.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Student not found" };
      } else {
        ctx.response.body = updatedStudent[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update student" };
    }
  });

  router.delete("/students/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedStudent = await db
        .delete(students)
        .where(eq(students.id, parseInt(id)))
        .returning();

      if (deletedStudent.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Student not found" };
      } else {
        ctx.response.body = { message: "Student deleted successfully" };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete student" };
    }
  });
}
