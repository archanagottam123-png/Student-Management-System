import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";
import { coursesTable } from "./courses";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  studentCode: text("student_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  gender: genderEnum("gender").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  address: text("address").notNull(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departmentsTable.id, { onDelete: "restrict" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "restrict" }),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  cgpa: numeric("cgpa", { precision: 3, scale: 2, mode: "number" }).notNull(),
  attendancePercentage: numeric("attendance_percentage", {
    precision: 5,
    scale: 2,
    mode: "number",
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type StudentRow = typeof studentsTable.$inferSelect;
