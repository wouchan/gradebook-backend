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
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
});

export const teachers = pgTable("teachers", {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
});

export const classes = pgTable("classes", {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull().unique(),
});

export const subjects = pgTable("subjects", {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull().unique(),
});

export const teachingRelations = pgTable(
    "teaching_relations",
    {
        classId: uuid().references(() => classes.id),
        subjectId: uuid().references(() => subjects.id),
        teacherId: uuid().references(() => teachers.id),
    },
    (table) => [primaryKey({ columns: [table.classId, table.subjectId] })]
);

export const grades = pgTable(
    "grades",
    {
        id: uuid().defaultRandom().primaryKey(),
        studentId: uuid().references(() => students.id),
        subjectId: uuid().references(() => subjects.id),
        value: integer().notNull(),
        createdAt: timestamp().defaultNow().notNull(),
        updatedAt: timestamp().defaultNow().notNull(),
    },
    (table) => [
        check("value_check_min_one", sql`${table.value} >= 1`),
        check("value_check_max_six", sql`${table.value} <= 6`),
    ]
);
