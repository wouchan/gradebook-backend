import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { classRelations } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerClassRelationsRoutes(router: Router) {
  router.get("/api/class-relations", async (ctx) => {
    try {
      const allClasses = await db.select().from(classRelations);
      ctx.response.body = allClasses;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch class relations" };
    }
  });

  router.get("/api/class-relations/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const classRelation = await db
        .select()
        .from(classRelations)
        .where(eq(classRelations.id, parseInt(id)))
        .limit(1);

      if (classRelation.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Class relation not found" };
      } else {
        ctx.response.body = classRelation[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch class relation" };
    }
  });

  router.post("/api/class-relations", async (ctx) => {
    const { classId, studentId } = await ctx.request.body.json() as {
      classId: number;
      studentId: number;
    };

    try {
      const newTeachingRelation = await db
        .insert(classRelations)
        .values({
          classId,
          studentId,
        })
        .returning();

      ctx.response.body = newTeachingRelation[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create class relation" };
    }
  });

  router.put("/api/class-relations/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };
    const { classId, studentId } = await ctx.request.body.json() as {
      classId: number;
      studentId: number;
    };

    try {
      const updatedTeachingRelation = await db
        .update(classRelations)
        .set({ classId, studentId })
        .where(eq(classRelations.id, parseInt(id)))
        .returning();

      if (updatedTeachingRelation.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Class relation not found" };
      } else {
        ctx.response.body = updatedTeachingRelation[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update class relation" };
    }
  });

  router.delete("/api/class-relations/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedTeachingRelation = await db
        .delete(classRelations)
        .where(eq(classRelations.id, parseInt(id)))
        .returning();

      if (deletedTeachingRelation.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Class relation not found" };
      } else {
        ctx.response.body = {
          message: "Class relation deleted successfully",
        };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete class relation" };
    }
  });
}
