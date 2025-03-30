import "dotenv/config";
import registerGradesRoutes from "./routes/grades.ts";
import registerClassesRoutes from "./routes/classes.ts";
import registerStudentRoutes from "./routes/students.ts";
import registerTeacherRoutes from "./routes/teachers.ts";
import registerSubjectsRoutes from "./routes/subjects.ts";
import { Application, Router } from "@oak/oak";

const router = new Router();

registerGradesRoutes(router);
registerClassesRoutes(router);
registerStudentRoutes(router);
registerTeacherRoutes(router);
registerSubjectsRoutes(router);

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 3000 });
