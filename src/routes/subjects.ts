import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { subjects } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerSubjectsRoutes(router: Router) {
  router.get("/subjects", async (ctx) => {
    try {
      const allSubjects = await db.select().from(subjects);
      ctx.response.body = allSubjects;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch subjects" };
    }
  });

  router.get("/subjects/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const subject = await db
        .select()
        .from(subjects)
        .where(eq(subjects.id, parseInt(id)))
        .limit(1);

      if (subject.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Subject not found" };
      } else {
        ctx.response.body = subject[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch subject" };
    }
  });

  router.post("/subjects", async (ctx) => {
    const { name } = await ctx.request.body.json() as {
      name: string;
    };

    try {
      const newSubject = await db
        .insert(subjects)
        .values({
          name,
        })
        .returning();

      ctx.response.body = newSubject[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create subject" };
    }
  });

  router.put("/subjects/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };
    const { name } = await ctx.request.body.json() as {
      name: string;
    };

    try {
      const updatedSubject = await db
        .update(subjects)
        .set({ name })
        .where(eq(subjects.id, parseInt(id)))
        .returning();

      if (updatedSubject.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Subject not found" };
      } else {
        ctx.response.body = updatedSubject[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update subject" };
    }
  });

  router.delete("/subjects/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedSubject = await db
        .delete(subjects)
        .where(eq(subjects.id, parseInt(id)))
        .returning();

      if (deletedSubject.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Subject not found" };
      } else {
        ctx.response.body = { message: "Subject deleted successfully" };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete subject" };
    }
  });
}
