import { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { classes } from "../db/schema";

export default function registerClassesRoutes(app: Express) {
    app.get("/classes", async (req, res) => {
        try {
            const allClasses = await db.select().from(classes);
            res.send(allClasses);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to fetch classes" });
        }
    });

    app.get("/classes/:id", async (req, res) => {
        const { id } = req.params as { id: string };

        try {
            const schoolClass = await db
                .select()
                .from(classes)
                .where(eq(classes.id, id))
                .limit(1);

            if (schoolClass.length === 0) {
                res.status(404).send({ error: "Class not found" });
                return;
            }

            res.send(schoolClass[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to fetch class" });
        }
    });

    app.post("/classes", async (req, res) => {
        const { name } = req.body as {
            name: string;
        };

        try {
            const newClass = await db
                .insert(classes)
                .values({
                    name,
                })
                .returning();

            res.send(newClass[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to create class" });
        }
    });

    app.put("/classes/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        const { name } = req.body as {
            name: string;
        };

        try {
            const updatedClass = await db
                .update(classes)
                .set({ name })
                .where(eq(classes.id, id))
                .returning();

            if (updatedClass.length === 0) {
                res.status(404).send({ error: "Class not found" });
                return;
            }

            res.send(updatedClass[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to update class" });
        }
    });

    app.delete("/classes/:id", async (req, res) => {
        const { id } = req.params as { id: string };

        try {
            const deletedClass = await db
                .delete(classes)
                .where(eq(classes.id, id))
                .returning();

            if (deletedClass.length === 0) {
                res.status(404).send({ error: "Class not found" });
                return;
            }

            res.send({ message: "Class deleted successfully" });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to delete class" });
        }
    });
}
