import { and, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { teachingRelations } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerTechingRelationsRoutes(router: Router) {
  router.get("/teaching-relations", async (ctx) => {
    try {
      const allClasses = await db.select().from(teachingRelations);
      ctx.response.body = allClasses;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch teaching relations" };
    }
  });

  router.get("/teaching-relations/:classId/:subjectId", async (ctx) => {
    const { classId, subjectId } = ctx.params as {
      classId: string;
      subjectId: string;
    };

    try {
      const teachingRelation = await db
        .select()
        .from(teachingRelations)
        .where(
          and(
            eq(teachingRelations.classId, parseInt(classId)),
            eq(teachingRelations.subjectId, parseInt(subjectId)),
          ),
        )
        .limit(1);

      if (teachingRelation.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Teaching relation not found" };
      } else {
        ctx.response.body = teachingRelation[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch teaching relation" };
    }
  });

  router.post("/teaching-relations", async (ctx) => {
    const { classId, subjectId, teacherId } = await ctx.request.body.json() as {
      classId: number;
      subjectId: number;
      teacherId: number;
    };

    try {
      const newTeachingRelation = await db
        .insert(teachingRelations)
        .values({
          classId,
          subjectId,
          teacherId,
        })
        .returning();

      ctx.response.body = newTeachingRelation[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create teaching relation" };
    }
  });

  router.put("/teaching-relations/:classId/:subjectId", async (ctx) => {
    const { classId, subjectId } = ctx.params as {
      classId: string;
      subjectId: string;
    };

    const { teacherId } = await ctx.request.body.json() as {
      teacherId: number;
    };

    try {
      const updatedTeachingRelation = await db
        .update(teachingRelations)
        .set({ teacherId })
        .where(
          and(
            eq(teachingRelations.classId, parseInt(classId)),
            eq(teachingRelations.subjectId, parseInt(subjectId)),
          ),
        )
        .returning();

      if (updatedTeachingRelation.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Teaching relation not found" };
      } else {
        ctx.response.body = updatedTeachingRelation[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update teaching relation" };
    }
  });

  router.delete("/teaching-relations/:classId/:subjectId", async (ctx) => {
    const { classId, subjectId } = ctx.params as {
      classId: string;
      subjectId: string;
    };

    try {
      const deletedTeachingRelation = await db
        .delete(teachingRelations)
        .where(
          and(
            eq(teachingRelations.classId, parseInt(classId)),
            eq(teachingRelations.subjectId, parseInt(subjectId)),
          ),
        )
        .returning();

      if (deletedTeachingRelation.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Teaching relation not found" };
      } else {
        ctx.response.body = {
          message: "Teaching relation deleted successfully",
        };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete teaching relation" };
    }
  });
}
