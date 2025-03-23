import "dotenv/config";
import express from "express";
import registerStudentRoutes from "./routes/students";
import registerTeacherRoutes from "./routes/teachers";
import registerGradesRoutes from "./routes/grades";
import registerSubjectsRoutes from "./routes/subjects";
import registerClassesRoutes from "./routes/classes";

const port = 3000;
const app = express();
app.use(express.json());

registerGradesRoutes(app);
registerStudentRoutes(app);
registerTeacherRoutes(app);
registerClassesRoutes(app);
registerSubjectsRoutes(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
