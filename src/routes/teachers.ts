import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { teachers } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerTeacherRoutes(router: Router) {
  router.get("/teachers", async (ctx) => {
    try {
      const allTeachers = await db.select().from(teachers);
      ctx.response.body = allTeachers;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch teachers" };
    }
  });

  router.get("/teachers/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const teacher = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, parseInt(id)))
        .limit(1);

      if (teacher.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Teacher not found" };
      } else {
        ctx.response.body = teacher[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch teacher" };
    }
  });

  router.post("/teachers", async (ctx) => {
    const { name, email } = await ctx.request.body.json() as {
      name: string;
      email: string;
    };

    try {
      const newTeacher = await db
        .insert(teachers)
        .values({
          name,
          email,
        })
        .returning();

      ctx.response.body = newTeacher[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create teacher" };
    }
  });

  router.put("/teachers/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };
    const { name, email } = await ctx.request.body.json() as {
      name: string;
      email: string;
    };

    try {
      const updatedTeacher = await db
        .update(teachers)
        .set({ name, email })
        .where(eq(teachers.id, parseInt(id)))
        .returning();

      if (updatedTeacher.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Teacher not found" };
      } else {
        ctx.response.body = updatedTeacher[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update teacher" };
    }
  });

  router.delete("/teachers/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedTeacher = await db
        .delete(teachers)
        .where(eq(teachers.id, parseInt(id)))
        .returning();

      if (deletedTeacher.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Teacher not found" };
      } else {
        ctx.response.body = { message: "Teacher deleted successfully" };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete teacher" };
    }
  });
}
