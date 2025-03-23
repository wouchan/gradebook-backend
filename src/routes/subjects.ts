import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { subjects } from "../db/schema";

export default function registerSubjectsRoutes(fastify: FastifyInstance) {
    fastify.get("/subjects", async (request, reply) => {
        try {
            const allSubjects = await db.select().from(subjects);
            return allSubjects;
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch subjects" });
        }
    });

    fastify.get("/subjects/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const subject = await db
                .select()
                .from(subjects)
                .where(eq(subjects.id, id))
                .limit(1);

            if (subject.length === 0) {
                return reply.code(404).send({ error: "Subject not found" });
            }

            return subject[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch subject" });
        }
    });

    fastify.post("/subjects", async (request, reply) => {
        const { name } = request.body as {
            name: string;
        };

        try {
            const newSubject = await db
                .insert(subjects)
                .values({
                    name,
                })
                .returning();

            return newSubject[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to create subject" });
        }
    });

    fastify.put("/subjects/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name } = request.body as {
            name: string;
        };

        try {
            const updatedSubject = await db
                .update(subjects)
                .set({ name })
                .where(eq(subjects.id, id))
                .returning();

            if (updatedSubject.length === 0) {
                return reply.code(404).send({ error: "Subject not found" });
            }

            return updatedSubject[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to update subject" });
        }
    });

    fastify.delete("/subjects/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const deletedSubject = await db
                .delete(subjects)
                .where(eq(subjects.id, id))
                .returning();

            if (deletedSubject.length === 0) {
                return reply.code(404).send({ error: "Subject not found" });
            }

            return { message: "Subject deleted successfully" };
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to delete subject" });
        }
    });
}
