import { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { grades } from "../db/schema.ts";

export default function registerGradesRoutes(app: Express) {
  app.get("/grades", async (req, res) => {
    try {
      const allGrades = await db.select().from(grades);
      res.send(allGrades);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to fetch grades" });
    }
  });

  app.get("/grades/:id", async (req, res) => {
    const { id } = req.params as { id: string };

    try {
      const grade = await db
        .select()
        .from(grades)
        .where(eq(grades.id, parseInt(id)))
        .limit(1);

      if (grade.length === 0) {
        res.status(404).send({ error: "Grade not found" });
        return;
      }

      res.send(grade[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to fetch grade" });
    }
  });

  app.post("/grades", async (req, res) => {
    const { studentId, subjectId, value } = req.body as {
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

      res.send(newGrade[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to create grade" });
    }
  });

  app.put("/grades/:id", async (req, res) => {
    const { id } = req.params as { id: string };
    const { studentId, subjectId, value } = req.body as {
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
        res.status(404).send({ error: "Grade not found" });
        return;
      }

      res.send(updatedGrade[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to update grade" });
    }
  });

  app.delete("/grades/:id", async (req, res) => {
    const { id } = req.params as { id: string };

    try {
      const deletedGrade = await db
        .delete(grades)
        .where(eq(grades.id, parseInt(id)))
        .returning();

      if (deletedGrade.length === 0) {
        res.status(404).send({ error: "Grade not found" });
        return;
      }

      res.send({ message: "Grade deleted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to delete grade" });
    }
  });
}
