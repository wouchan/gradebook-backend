import { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { students } from "../db/schema";

export default function registerStudentRoutes(app: Express) {
    app.get("/students", async (req, res) => {
        try {
            const allStudents = await db.select().from(students);
            res.send(allStudents);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to fetch students" });
        }
    });

    app.get("/students/:id", async (req, res) => {
        const { id } = req.params as { id: string };

        try {
            const student = await db
                .select()
                .from(students)
                .where(eq(students.id, parseInt(id)))
                .limit(1);

            if (student.length === 0) {
                res.status(404).send({ error: "Student not found" });
                return;
            }

            res.send(student[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to fetch student" });
        }
    });

    app.post("/students", async (req, res) => {
        const { name, email, classId } = req.body as {
            name: string;
            email: string;
            classId: number;
        };

        try {
            const newStudent = await db
                .insert(students)
                .values({
                    name,
                    email,
                    classId,
                })
                .returning();

            res.send(newStudent[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to create student" });
        }
    });

    app.put("/students/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        const { name, email, classId } = req.body as {
            name: string;
            email: string;
            classId: number;
        };

        try {
            const updatedStudent = await db
                .update(students)
                .set({ name, email, classId })
                .where(eq(students.id, parseInt(id)))
                .returning();

            if (updatedStudent.length === 0) {
                res.status(404).send({ error: "Student not found" });
                return;
            }

            res.send(updatedStudent[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to update student" });
        }
    });

    app.delete("/students/:id", async (req, res) => {
        const { id } = req.params as { id: string };

        try {
            const deletedStudent = await db
                .delete(students)
                .where(eq(students.id, parseInt(id)))
                .returning();

            if (deletedStudent.length === 0) {
                res.status(404).send({ error: "Student not found" });
            }

            res.send({ message: "Student deleted successfully" });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Failed to delete student" });
        }
    });
}
