import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { grades } from "../db/schema";

export default function registerGradesRoutes(fastify: FastifyInstance) {
    fastify.get("/grades", async (request, reply) => {
        try {
            const allGrades = await db.select().from(grades);
            return allGrades;
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch grades" });
        }
    });

    fastify.get("/grades/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const grade = await db
                .select()
                .from(grades)
                .where(eq(grades.id, id))
                .limit(1);

            if (grade.length === 0) {
                return reply.code(404).send({ error: "Grade not found" });
            }

            return grade[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch grade" });
        }
    });

    fastify.post("/grades", async (request, reply) => {
        const { studentId, subjectId, value } = request.body as {
            studentId: string;
            subjectId: string;
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

            return newGrade[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to create grade" });
        }
    });

    fastify.put("/grades/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { studentId, subjectId, value } = request.body as {
            studentId: string;
            subjectId: string;
            value: number;
        };

        try {
            const updatedGrade = await db
                .update(grades)
                .set({ studentId, subjectId, value })
                .where(eq(grades.id, id))
                .returning();

            if (updatedGrade.length === 0) {
                return reply.code(404).send({ error: "Grade not found" });
            }

            return updatedGrade[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to update grade" });
        }
    });

    fastify.delete("/grades/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const deletedGrade = await db
                .delete(grades)
                .where(eq(grades.id, id))
                .returning();

            if (deletedGrade.length === 0) {
                return reply.code(404).send({ error: "Grade not found" });
            }

            return { message: "Grade deleted successfully" };
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to delete grade" });
        }
    });
}
