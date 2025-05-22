import { InferSelectModel, sql } from "drizzle-orm";
import {
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  salt: text("salt").notNull(),
  password_hash: text("password_hash").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  accountId: serial("account_id").notNull().references(() => accounts.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const classRelations = pgTable("class_relations", {
  id: serial("id").primaryKey(),
  classId: serial("class_id").references(() => classes.id),
  studentId: serial("student_id").references(() => accounts.id).unique()
    .notNull(),
});

export const teachingRelations = pgTable(
  "teaching_relations",
  {
    classId: serial("class_id").references(() => classes.id),
    subjectId: serial("subject_id").references(() => subjects.id),
    teacherId: serial("teacher_id").references(() => accounts.id),
  },
  (table) => [primaryKey({ columns: [table.classId, table.subjectId] })],
);

export const grades = pgTable(
  "grades",
  {
    id: serial("id").primaryKey(),
    studentId: serial("student_id").references(() => accounts.id).notNull(),
    subjectId: serial("subject_id").references(() => subjects.id).notNull(),
    value: integer("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    check("value_check_min_one", sql`${table.value} >= 1`),
    check("value_check_max_six", sql`${table.value} <= 6`),
  ],
);

export type Account = InferSelectModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;
