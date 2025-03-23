import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { teachers } from "../db/schema";

export default function registerTeacherRoutes(fastify: FastifyInstance) {
    fastify.get("/teachers", async (request, reply) => {
        try {
            const allTeachers = await db.select().from(teachers);
            return allTeachers;
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch teachers" });
        }
    });

    fastify.get("/teachers/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const teacher = await db
                .select()
                .from(teachers)
                .where(eq(teachers.id, id))
                .limit(1);

            if (teacher.length === 0) {
                return reply.code(404).send({ error: "Teacher not found" });
            }

            return teacher[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch teacher" });
        }
    });

    fastify.post("/teachers", async (request, reply) => {
        const { name, email } = request.body as {
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

            return newTeacher[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to create teacher" });
        }
    });

    fastify.put("/teachers/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name, email } = request.body as {
            name: string;
            email: string;
        };

        try {
            const updatedTeacher = await db
                .update(teachers)
                .set({ name, email })
                .where(eq(teachers.id, id))
                .returning();

            if (updatedTeacher.length === 0) {
                return reply.code(404).send({ error: "Teacher not found" });
            }

            return updatedTeacher[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to update teacher" });
        }
    });

    fastify.delete("/teachers/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const deletedTeacher = await db
                .delete(teachers)
                .where(eq(teachers.id, id))
                .returning();

            if (deletedTeacher.length === 0) {
                return reply.code(404).send({ error: "Teacher not found" });
            }

            return { message: "Teacher deleted successfully" };
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to delete teacher" });
        }
    });
}
