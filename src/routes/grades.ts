import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { grades } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerGradesRoutes(router: Router) {
  router.get("/api/grades", async (ctx) => {
    try {
      const allGrades = await db.select().from(grades);
      ctx.response.body = allGrades;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch grades" };
    }
  });

  router.get("/api/grades/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const grade = await db
        .select()
        .from(grades)
        .where(eq(grades.id, parseInt(id)))
        .limit(1);

      if (grade.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Grade not found" };
      } else {
        ctx.response.body = grade[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch grade" };
    }
  });

  router.post("/api/grades", async (ctx) => {
    const { studentId, subjectId, value } = await ctx.request.body.json() as {
      studentId: number;
      subjectId: number;
      value: number;
    };

    try {
      const newGrade = await db
        .insert(grades)
        .values({
          studentId,
          subjectId,
          value,
        })
        .returning();

      ctx.response.body = newGrade[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create grade" };
    }
  });

  router.put("/api/grades/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };
    const { studentId, subjectId, value } = await ctx.request.body.json() as {
      studentId: number;
      subjectId: number;
      value: number;
    };

    try {
      const updatedGrade = await db
        .update(grades)
        .set({ studentId, subjectId, value })
        .where(eq(grades.id, parseInt(id)))
        .returning();

      if (updatedGrade.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Grade not found" };
      } else {
        ctx.response.body = updatedGrade[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update grade" };
    }
  });

  router.delete("/api/grades/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedGrade = await db
        .delete(grades)
        .where(eq(grades.id, parseInt(id)))
        .returning();

      if (deletedGrade.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Grade not found" };
      } else {
        ctx.response.body = { message: "Grade deleted successfully" };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete grade" };
    }
  });
}
