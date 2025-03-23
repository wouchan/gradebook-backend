import { sql } from "drizzle-orm";
import {
    check,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const students = pgTable("students", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
});

export const teachers = pgTable("teachers", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
});

export const classes = pgTable("classes", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
});

export const subjects = pgTable("subjects", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
});

export const teachingRelations = pgTable(
    "teaching_relations",
    {
        classId: uuid("class_id").references(() => classes.id),
        subjectId: uuid("subject_id").references(() => subjects.id),
        teacherId: uuid("teacher_id").references(() => teachers.id),
    },
    (table) => [primaryKey({ columns: [table.classId, table.subjectId] })]
);

export const grades = pgTable(
    "grades",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        studentId: uuid("student_id").references(() => students.id),
        subjectId: uuid("subject_id").references(() => subjects.id),
        value: integer("value").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        check("value_check_min_one", sql`${table.value} >= 1`),
        check("value_check_max_six", sql`${table.value} <= 6`),
    ]
);
