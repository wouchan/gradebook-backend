import { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { teachers } from "../db/schema.ts";

export default function registerTeacherRoutes(app: Express) {
  app.get("/teachers", async (req, res) => {
    try {
      const allTeachers = await db.select().from(teachers);
      res.send(allTeachers);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to fetch teachers" });
    }
  });

  app.get("/teachers/:id", async (req, res) => {
    const { id } = req.params as { id: string };

    try {
      const teacher = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, parseInt(id)))
        .limit(1);

      if (teacher.length === 0) {
        res.status(404).send({ error: "Teacher not found" });
        return;
      }

      res.send(teacher[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to fetch teacher" });
    }
  });

  app.post("/teachers", async (req, res) => {
    const { name, email } = req.body as {
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

      res.send(newTeacher[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to create teacher" });
    }
  });

  app.put("/teachers/:id", async (req, res) => {
    const { id } = req.params as { id: string };
    const { name, email } = req.body as {
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
        res.status(404).send({ error: "Teacher not found" });
        return;
      }

      res.send(updatedTeacher[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to update teacher" });
    }
  });

  app.delete("/teachers/:id", async (req, res) => {
    const { id } = req.params as { id: string };

    try {
      const deletedTeacher = await db
        .delete(teachers)
        .where(eq(teachers.id, parseInt(id)))
        .returning();

      if (deletedTeacher.length === 0) {
        res.status(404).send({ error: "Teacher not found" });
        return;
      }

      res.send({ message: "Teacher deleted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Failed to delete teacher" });
    }
  });
}
