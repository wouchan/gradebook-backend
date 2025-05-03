import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { classes } from "../db/schema.ts";
import { Router } from "@oak/oak/router";

export default function registerClassesRoutes(router: Router) {
  router.get("/api/classes", async (ctx) => {
    try {
      const allClasses = await db.select().from(classes);
      ctx.response.body = allClasses;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch classes" };
    }
  });

  router.get("/api/classes/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const schoolClass = await db
        .select()
        .from(classes)
        .where(eq(classes.id, parseInt(id)))
        .limit(1);

      if (schoolClass.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Class not found" };
      } else {
        ctx.response.body = schoolClass[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch class" };
    }
  });

  router.post("/api/classes", async (ctx) => {
    const { name } = await ctx.request.body.json() as {
      name: string;
    };

    try {
      const newClass = await db
        .insert(classes)
        .values({
          name,
        })
        .returning();

      ctx.response.body = newClass[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create class" };
    }
  });

  router.put("/api/classes/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };
    const { name } = await ctx.request.body.json() as {
      name: string;
    };

    try {
      const updatedClass = await db
        .update(classes)
        .set({ name })
        .where(eq(classes.id, parseInt(id)))
        .returning();

      if (updatedClass.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Class not found" };
      } else {
        ctx.response.body = updatedClass[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to update class" };
    }
  });

  router.delete("/api/classes/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedClass = await db
        .delete(classes)
        .where(eq(classes.id, parseInt(id)))
        .returning();

      if (deletedClass.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Class not found" };
      } else {
        ctx.response.body = { message: "Class deleted successfully" };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete class" };
    }
  });
}
