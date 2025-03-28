import "dotenv/config";
import express from "express";
import registerStudentRoutes from "./routes/students.ts";
import registerTeacherRoutes from "./routes/teachers.ts";
import registerGradesRoutes from "./routes/grades.ts";
import registerSubjectsRoutes from "./routes/subjects.ts";
import registerClassesRoutes from "./routes/classes.ts";

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
