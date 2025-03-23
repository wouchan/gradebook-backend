import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { classes } from "../db/schema";

export default function registerClassesRoutes(fastify: FastifyInstance) {
    fastify.get("/classes", async (request, reply) => {
        try {
            const allClasses = await db.select().from(classes);
            return allClasses;
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch classes" });
        }
    });

    fastify.get("/classes/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const schoolClass = await db
                .select()
                .from(classes)
                .where(eq(classes.id, id))
                .limit(1);

            if (schoolClass.length === 0) {
                return reply.code(404).send({ error: "Class not found" });
            }

            return schoolClass[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to fetch class" });
        }
    });

    fastify.post("/classes", async (request, reply) => {
        const { name } = request.body as {
            name: string;
        };

        try {
            const newClass = await db
                .insert(classes)
                .values({
                    name,
                })
                .returning();

            return newClass[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to create class" });
        }
    });

    fastify.put("/classes/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name } = request.body as {
            name: string;
        };

        try {
            const updatedClass = await db
                .update(classes)
                .set({ name })
                .where(eq(classes.id, id))
                .returning();

            if (updatedClass.length === 0) {
                return reply.code(404).send({ error: "Class not found" });
            }

            return updatedClass[0];
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to update class" });
        }
    });

    fastify.delete("/classes/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const deletedClass = await db
                .delete(classes)
                .where(eq(classes.id, id))
                .returning();

            if (deletedClass.length === 0) {
                return reply.code(404).send({ error: "Class not found" });
            }

            return { message: "Class deleted successfully" };
        } catch (err) {
            console.log(err);
            reply.code(500).send({ error: "Failed to delete class" });
        }
    });
}
