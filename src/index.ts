import "dotenv/config";
import registerGradesRoutes from "./routes/grades.ts";
import registerClassesRoutes from "./routes/classes.ts";
import registerAccountsRoutes from "./routes/accounts.ts";
import registerSubjectsRoutes from "./routes/subjects.ts";
import registerClassRelationsRoutes from "./routes/class-relations.ts";
import registerTeachingRelationsRoutes from "./routes/teaching-relations.ts";
import { Application, Router } from "@oak/oak";

const router = new Router();

registerGradesRoutes(router);
registerClassesRoutes(router);
registerAccountsRoutes(router);
registerSubjectsRoutes(router);
registerClassRelationsRoutes(router);
registerTeachingRelationsRoutes(router);

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 3000 });
