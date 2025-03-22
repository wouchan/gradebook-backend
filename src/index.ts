import "dotenv/config";
import { eq } from "drizzle-orm";
import { students } from "./db/schema";
import { db } from "./db";
import Fastify from "fastify";

const fastify = Fastify({
    logger: true,
});

fastify.get("/students", async (request, reply) => {
    try {
        const allStudents = await db.select().from(students);
        return allStudents;
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: "Failed to fetch students" });
    }
});

fastify.get("/students/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
        const user = await db
            .select()
            .from(students)
            .where(eq(students.id, id))
            .limit(1);

        if (user.length === 0) {
            return reply.code(404).send({ error: "Student not found" });
        }

        return user[0];
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: "Failed to fetch student" });
    }
});

fastify.post("/students", async (request, reply) => {
    const { name, email } = request.body as {
        name: string;
        email: string;
    };

    try {
        const newStudent = await db
            .insert(students)
            .values({
                name,
                email,
            })
            .returning();

        return newStudent[0];
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: "Failed to create student" });
    }
});

fastify.put("/students/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, email } = request.body as {
        name: string;
        email: string;
    };

    try {
        const updatedStudent = await db
            .update(students)
            .set({ name, email })
            .where(eq(students.id, id))
            .returning();

        if (updatedStudent.length === 0) {
            return reply.code(404).send({ error: "Student not found" });
        }

        return updatedStudent[0];
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: "Failed to update student" });
    }
});

fastify.delete("/students/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
        const deletedStudent = await db
            .delete(students)
            .where(eq(students.id, id))
            .returning();

        if (deletedStudent.length === 0) {
            return reply.code(404).send({ error: "Student not found" });
        }

        return { message: "Student deleted successfully" };
    } catch (err) {
        console.log(err);
        reply.code(500).send({ error: "Failed to delete student" });
    }
});

const start = async () => {
    try {
        await fastify.listen({
            port: Number(process.env.PORT) || 3000,
            host: "0.0.0.0",
        });
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
