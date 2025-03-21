import "dotenv/config";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";
import { db } from "./db";
import Fastify from "fastify";

const fastify = Fastify({
    logger: true,
});

fastify.get("/users", async (request, reply) => {
    try {
        const allUsers = await db.select().from(users);
        return allUsers;
    } catch (error) {
        reply.code(500).send({ error: "Failed to fetch users" });
    }
});

fastify.get("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        if (user.length === 0) {
            return reply.code(404).send({ error: "User not found" });
        }

        return user[0];
    } catch (error) {
        reply.code(500).send({ error: "Failed to fetch user" });
    }
});

fastify.post("/users", async (request, reply) => {
    const { name, age, email } = request.body as {
        name: string;
        age: number;
        email: string;
    };

    try {
        const newUser = await db
            .insert(users)
            .values({
                name,
                age,
                email,
            })
            .returning();

        return newUser[0];
    } catch (error) {
        reply.code(500).send({ error: "Failed to create user" });
    }
});

fastify.put("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, age, email } = request.body as {
        name: string;
        age: number;
        email: string;
    };

    try {
        const updatedUser = await db
            .update(users)
            .set({ name, age, email })
            .where(eq(users.id, parseInt(id)))
            .returning();

        if (updatedUser.length === 0) {
            return reply.code(404).send({ error: "User not found" });
        }

        return updatedUser[0];
    } catch (error) {
        reply.code(500).send({ error: "Failed to update user" });
    }
});

fastify.delete("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
        const deletedUser = await db
            .delete(users)
            .where(eq(users.id, parseInt(id)))
            .returning();

        if (deletedUser.length === 0) {
            return reply.code(404).send({ error: "User not found" });
        }

        return { message: "User deleted successfully" };
    } catch (error) {
        reply.code(500).send({ error: "Failed to delete user" });
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
