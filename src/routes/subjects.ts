import { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { subjects } from "../db/schema";

export default function registerSubjectsRoutes(app: Express) {
    app.get("/subjects", async (req, res) => {
        try {
            const allSubjects = await db.select().from(subjects);
            res.send(allSubjects);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to fetch subjects" });
        }
    });

    app.get("/subjects/:id", async (req, res) => {
        const { id } = req.params as { id: string };

        try {
            const subject = await db
                .select()
                .from(subjects)
                .where(eq(subjects.id, id))
                .limit(1);

            if (subject.length === 0) {
                res.status(404).send({ error: "Subject not found" });
                return;
            }

            res.send(subject[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to fetch subject" });
        }
    });

    app.post("/subjects", async (req, res) => {
        const { name } = req.body as {
            name: string;
        };

        try {
            const newSubject = await db
                .insert(subjects)
                .values({
                    name,
                })
                .returning();

            res.send(newSubject[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to create subject" });
        }
    });

    app.put("/subjects/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        const { name } = req.body as {
            name: string;
        };

        try {
            const updatedSubject = await db
                .update(subjects)
                .set({ name })
                .where(eq(subjects.id, id))
                .returning();

            if (updatedSubject.length === 0) {
                res.status(404).send({ error: "Subject not found" });
                return;
            }

            res.send(updatedSubject[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to update subject" });
        }
    });

    app.delete("/subjects/:id", async (req, res) => {
        const { id } = req.params as { id: string };

        try {
            const deletedSubject = await db
                .delete(subjects)
                .where(eq(subjects.id, id))
                .returning();

            if (deletedSubject.length === 0) {
                res.status(404).send({ error: "Subject not found" });
                return;
            }

            res.send({ message: "Subject deleted successfully" });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to delete subject" });
        }
    });
}
