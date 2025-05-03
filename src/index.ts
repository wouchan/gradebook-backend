import "dotenv/config";
import registerAuthRoutes from "./routes/auth.ts";
import registerGradesRoutes from "./routes/grades.ts";
import registerClassesRoutes from "./routes/classes.ts";
import registerAccountsRoutes from "./routes/accounts.ts";
import registerSubjectsRoutes from "./routes/subjects.ts";
import registerClassRelationsRoutes from "./routes/class-relations.ts";
import registerTeachingRelationsRoutes from "./routes/teaching-relations.ts";
import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";

const router = new Router();

registerAuthRoutes(router);
registerGradesRoutes(router);
registerClassesRoutes(router);
registerAccountsRoutes(router);
registerSubjectsRoutes(router);
registerClassRelationsRoutes(router);
registerTeachingRelationsRoutes(router);

const app = new Application();

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 3000 });
