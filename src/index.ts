import "dotenv/config";
import Fastify from "fastify";
import registerStudentRoutes from "./routes/students";
import registerTeacherRoutes from "./routes/teachers";
import registerGradesRoutes from "./routes/grades";
import registerSubjectsRoutes from "./routes/subjects";
import registerClassesRoutes from "./routes/classes";

const fastify = Fastify({
    logger: true,
});

registerGradesRoutes(fastify);
registerStudentRoutes(fastify);
registerTeacherRoutes(fastify);
registerClassesRoutes(fastify);
registerSubjectsRoutes(fastify);

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
