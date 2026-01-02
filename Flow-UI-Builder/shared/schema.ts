import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Admins and Teachers)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "teacher"] }).notNull(),
  name: text("name").notNull(),
  assignedClass: text("assigned_class"), // Only for teachers
  assignedSection: text("assigned_section"), // Only for teachers
  isActive: boolean("is_active").default(true),
});

// Students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  rollNumber: text("roll_number").notNull(),
  registerNumber: text("register_number").notNull(),
  parentName: text("parent_name").notNull(),
  address: text("address").notNull(),
  dob: text("dob").notNull(), // YYYY-MM-DD
});

// Marks
export const marks = pgTable("marks", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  examName: text("exam_name").notNull(), // Midterm Test-1, Quarterly Exam, etc.
  subject: text("subject").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
});

// Suggestions
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertMarkSchema = createInsertSchema(marks).omit({ id: true });
export const insertSuggestionSchema = createInsertSchema(suggestions).omit({ id: true, date: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Mark = typeof marks.$inferSelect;
export type InsertMark = z.infer<typeof insertMarkSchema>;
export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;

// API Request Types
export type LoginRequest = {
  username?: string;
  password?: string;
  role: "admin" | "teacher" | "student";
  // For student login
  name?: string;
  class?: string;
  dob?: string;
};

export type CsvImportRequest = {
  csvContent: string;
};

export type MarkEntryRequest = {
  studentId: number;
  examName: string;
  subject: string;
  score: number;
  total: number;
};
