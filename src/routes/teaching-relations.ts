import { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { teachingRelations } from "../db/schema";

export default function registerClassesRoutes(fastify: FastifyInstance) {
    fastify.get("/teaching-relations", async (request, reply) => {
        try {
            const allClasses = await db.select().from(teachingRelations);
            return allClasses;
        } catch (err) {
            console.log(err);
            reply
                .code(500)
                .send({ error: "Failed to fetch teaching relations" });
        }
    });

    fastify.get(
        "/teaching-relations/:classId/:subjectId",
        async (request, reply) => {
            const { classId, subjectId } = request.params as {
                classId: string;
                subjectId: string;
            };

            try {
                const techingRelation = await db
                    .select()
                    .from(teachingRelations)
                    .where(
                        and(
                            eq(teachingRelations.classId, classId),
                            eq(teachingRelations.subjectId, subjectId)
                        )
                    )
                    .limit(1);

                if (techingRelation.length === 0) {
                    return reply
                        .code(404)
                        .send({ error: "Teaching relation not found" });
                }

                return techingRelation[0];
            } catch (err) {
                console.log(err);
                reply
                    .code(500)
                    .send({ error: "Failed to fetch teaching relation" });
            }
        }
    );

    fastify.post("/teaching-relations", async (request, reply) => {
        const { classId, subjectId, teacherId } = request.body as {
            classId: string;
            subjectId: string;
            teacherId: string;
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

            return newTeachingRelation[0];
        } catch (err) {
            console.log(err);
            reply
                .code(500)
                .send({ error: "Failed to create teaching relation" });
        }
    });

    fastify.put(
        "/teaching-relations/:classId/:subjectId",
        async (request, reply) => {
            const { classId, subjectId } = request.params as {
                classId: string;
                subjectId: string;
            };

            const { teacherId } = request.body as {
                teacherId: string;
            };

            try {
                const updatedTeachingRelation = await db
                    .update(teachingRelations)
                    .set({ teacherId })
                    .where(
                        and(
                            eq(teachingRelations.classId, classId),
                            eq(teachingRelations.subjectId, subjectId)
                        )
                    )
                    .returning();

                if (updatedTeachingRelation.length === 0) {
                    return reply
                        .code(404)
                        .send({ error: "Teaching relation not found" });
                }

                return updatedTeachingRelation[0];
            } catch (err) {
                console.log(err);
                reply
                    .code(500)
                    .send({ error: "Failed to update teaching relation" });
            }
        }
    );

    fastify.delete(
        "/teaching-relations/:classId/:subjectId",
        async (request, reply) => {
            const { classId, subjectId } = request.params as {
                classId: string;
                subjectId: string;
            };

            try {
                const deletedTeachingRelation = await db
                    .delete(teachingRelations)
                    .where(
                        and(
                            eq(teachingRelations.classId, classId),
                            eq(teachingRelations.subjectId, subjectId)
                        )
                    )
                    .returning();

                if (deletedTeachingRelation.length === 0) {
                    return reply
                        .code(404)
                        .send({ error: "Teaching relation not found" });
                }

                return { message: "Teaching relation deleted successfully" };
            } catch (err) {
                console.log(err);
                reply
                    .code(500)
                    .send({ error: "Failed to delete teaching relation" });
            }
        }
    );
}
