import { Express } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { teachingRelations } from "../db/schema.ts";

export default function registerClassesRoutes(app: Express) {
  app.get("/teaching-relations", async (req, res) => {
    try {
      const allClasses = await db.select().from(teachingRelations);
      res.send(allClasses);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Failed to fetch teaching relations",
      });
    }
  });

  app.get("/teaching-relations/:classId/:subjectId", async (req, res) => {
    const { classId, subjectId } = req.params as {
      classId: string;
      subjectId: string;
    };

    try {
      const techingRelation = await db
        .select()
        .from(teachingRelations)
        .where(
          and(
            eq(teachingRelations.classId, parseInt(classId)),
            eq(teachingRelations.subjectId, parseInt(subjectId)),
          ),
        )
        .limit(1);

      if (techingRelation.length === 0) {
        res.status(404).send({ error: "Teaching relation not found" });
        return;
      }

      res.send(techingRelation[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Failed to fetch teaching relation",
      });
    }
  });

  app.post("/teaching-relations", async (req, res) => {
    const { classId, subjectId, teacherId } = req.body as {
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

      res.send(newTeachingRelation[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Failed to create teaching relation",
      });
    }
  });

  app.put("/teaching-relations/:classId/:subjectId", async (req, res) => {
    const { classId, subjectId } = req.params as {
      classId: string;
      subjectId: string;
    };

    const { teacherId } = req.body as {
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
        res.status(404).send({ error: "Teaching relation not found" });
        return;
      }

      res.send(updatedTeachingRelation[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Failed to update teaching relation",
      });
    }
  });

  app.delete("/teaching-relations/:classId/:subjectId", async (req, res) => {
    const { classId, subjectId } = req.params as {
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
        res.status(404).send({ error: "Teaching relation not found" });
        return;
      }

      res.send({ message: "Teaching relation deleted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Failed to delete teaching relation",
      });
    }
  });
}
