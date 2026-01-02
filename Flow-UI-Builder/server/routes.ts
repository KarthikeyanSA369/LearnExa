import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: { maxAge: 86400000 },
    })
  );

  // Auth Middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session.user) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.session.user && req.session.role === "admin") return next();
    res.status(403).json({ message: "Forbidden" });
  };
  
  const isTeacher = (req: any, res: any, next: any) => {
    if (req.session.user && req.session.role === "teacher") return next();
    res.status(403).json({ message: "Forbidden" });
  };

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      
      if (input.role === "admin" || input.role === "teacher") {
        if (!input.username || !input.password) {
           return res.status(400).json({ message: "Username and password required" });
        }
        const user = await storage.getUserByUsername(input.username);
        if (!user || user.password !== input.password || user.role !== input.role) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.isActive) {
           return res.status(403).json({ message: "Account deactivated" });
        }
        req.session.user = user;
        req.session.role = user.role;
        return res.json({ user, role: user.role });
      } else if (input.role === "student") {
        if (!input.name || !input.class || !input.dob) {
           return res.status(400).json({ message: "Name, Class, and DOB required" });
        }
        const student = await storage.getStudentByNameClassDob(input.name, input.class, input.dob);
        if (!student) {
          return res.status(401).json({ message: "Student not found" });
        }
        req.session.user = student;
        req.session.role = "student";
        return res.json({ user: student, role: "student" });
      }
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Admin Routes
  app.get(api.admin.getTeachers.path, isAuthenticated, isAdmin, async (req, res) => {
    const teachers = await storage.getTeachers();
    res.json(teachers);
  });

  app.post(api.admin.createTeacher.path, isAuthenticated, isAdmin, async (req, res) => {
    const input = api.admin.createTeacher.input.parse(req.body);
    const user = await storage.createUser({ ...input, role: "teacher" });
    res.status(201).json(user);
  });

  app.put(api.admin.updateTeacher.path, isAuthenticated, isAdmin, async (req, res) => {
    const input = api.admin.updateTeacher.input.parse(req.body);
    const user = await storage.updateUser(Number(req.params.id), input);
    res.json(user);
  });

  // Teacher Routes
  app.get(api.teacher.getStudents.path, isAuthenticated, isTeacher, async (req, res) => {
    // In a real app, use req.session.user.assignedClass
    const teacher = req.session.user;
    // For now, return all students or mocked logic for demo
    // We will list students that match the teacher's assigned class if set, else all
    if (teacher.assignedClass) {
        const students = await storage.getStudentsByClass(teacher.assignedClass);
        res.json(students);
    } else {
        // Fallback or empty
         res.json([]);
    }
  });

  app.post(api.teacher.importStudents.path, isAuthenticated, isTeacher, async (req, res) => {
    const { csvContent } = req.body;
    // Simple CSV parse: Name,Class,Section,RollNo,RegNo,Parent,Address,DOB
    // Skip header
    const lines = csvContent.split('\n').slice(1);
    let count = 0;
    for (const line of lines) {
        if (!line.trim()) continue;
        const [name, className, section, rollNumber, registerNumber, parentName, address, dob] = line.split(',').map(s => s.trim());
        if (name) {
            await storage.createStudent({
                name, class: className, section, rollNumber, registerNumber, parentName, address, dob
            });
            count++;
        }
    }
    res.json({ count });
  });

  app.get(api.teacher.getMarks.path, isAuthenticated, isTeacher, async (req, res) => {
    const marks = await storage.getMarks(Number(req.params.id));
    res.json(marks);
  });

  app.post(api.teacher.updateMarks.path, isAuthenticated, isTeacher, async (req, res) => {
    const input = api.teacher.updateMarks.input.parse(req.body);
    await storage.updateMarks(input);
    res.json({ message: "Marks updated" });
  });

  app.post(api.teacher.addSuggestion.path, isAuthenticated, isTeacher, async (req, res) => {
    const input = api.teacher.addSuggestion.input.parse(req.body);
    const suggestion = await storage.addSuggestion({
        ...input,
        studentId: Number(req.params.id),
        teacherId: req.session.user.id
    });
    res.status(201).json(suggestion);
  });

  // Student Routes
  app.get(api.student.getData.path, isAuthenticated, async (req, res) => {
    if (req.session.role !== 'student') return res.status(403).json({ message: "Not a student" });
    const student = req.session.user;
    const marks = await storage.getMarks(student.id);
    const suggestions = await storage.getSuggestions(student.id);
    res.json({ student, marks, suggestions });
  });

  // Seed Admin
  const admin = await storage.getUserByUsername("admin");
  if (!admin) {
    await storage.createUser({
        username: "admin",
        password: "adminpassword", // In production hash this
        role: "admin",
        name: "System Admin",
        isActive: true
    });
  }

  // Seed Teacher for Demo
  const demoTeacher = await storage.getUserByUsername("teacher");
  if (!demoTeacher) {
      await storage.createUser({
          username: "teacher",
          password: "password",
          role: "teacher",
          name: "John Doe",
          assignedClass: "CSE-A",
          assignedSection: "A",
          isActive: true
      });
  }
  
  // Seed Student for Demo
  const demoStudent = await storage.getStudentByNameClassDob("Student One", "CSE-A", "2000-01-01");
  if (!demoStudent) {
      const s = await storage.createStudent({
          name: "Student One",
          class: "CSE-A",
          section: "A",
          rollNumber: "101",
          registerNumber: "REG101",
          parentName: "Parent One",
          address: "123 St",
          dob: "2000-01-01"
      });
      // Add some marks
      await storage.updateMarks([
          { studentId: s.id, examName: "Midterm Test-1", subject: "Math", score: 85, total: 100 },
          { studentId: s.id, examName: "Midterm Test-1", subject: "Physics", score: 78, total: 100 },
          { studentId: s.id, examName: "Quarterly Exam", subject: "Math", score: 90, total: 100 },
      ]);
      await storage.addSuggestion({
          studentId: s.id,
          teacherId: 1, // assuming mocked
          content: "Great progress in Math, keep it up!"
      });
  }

  return httpServer;
}
