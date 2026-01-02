import { db } from "./db";
import {
  users, students, marks, suggestions,
  type User, type InsertUser, type Student, type InsertStudent,
  type Mark, type InsertMark, type Suggestion, type InsertSuggestion
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users (Teachers/Admin)
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getTeachers(): Promise<User[]>;
  
  // Students
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentsByClass(className: string): Promise<Student[]>; // Simplified: get all for teacher's class
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByNameClassDob(name: string, className: string, dob: string): Promise<Student | undefined>;
  
  // Marks
  getMarks(studentId: number): Promise<Mark[]>;
  updateMarks(marks: InsertMark[]): Promise<void>;
  
  // Suggestions
  getSuggestions(studentId: number): Promise<Suggestion[]>;
  addSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
}

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async getTeachers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "teacher"));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    // Ideally filter by class, but for now filtering by class string
    // In real app, teacher has assignedClass.
    return await db.select().from(students).where(eq(students.class, className));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByNameClassDob(name: string, className: string, dob: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(
      and(
        eq(students.name, name),
        eq(students.class, className),
        eq(students.dob, dob)
      )
    );
    return student;
  }

  async getMarks(studentId: number): Promise<Mark[]> {
    return await db.select().from(marks).where(eq(marks.studentId, studentId));
  }

  async updateMarks(newMarks: InsertMark[]): Promise<void> {
    // Naive implementation: delete existing marks for this student/exam/subject tuple and insert new?
    // Or just insert/update on conflict.
    // For simplicity, we just insert. In production, use transaction + upsert.
    for (const mark of newMarks) {
      // Check if exists
      const existing = await db.select().from(marks).where(
        and(
          eq(marks.studentId, mark.studentId),
          eq(marks.examName, mark.examName),
          eq(marks.subject, mark.subject)
        )
      );
      
      if (existing.length > 0) {
        await db.update(marks)
          .set({ score: mark.score, total: mark.total })
          .where(eq(marks.id, existing[0].id));
      } else {
        await db.insert(marks).values(mark);
      }
    }
  }

  async getSuggestions(studentId: number): Promise<Suggestion[]> {
    return await db.select().from(suggestions).where(eq(suggestions.studentId, studentId));
  }

  async addSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    const [newSuggestion] = await db.insert(suggestions).values(suggestion).returning();
    return newSuggestion;
  }
}

export const storage = new DatabaseStorage();
