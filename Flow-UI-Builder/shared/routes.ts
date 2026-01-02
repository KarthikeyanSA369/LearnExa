import { z } from 'zod';
import { insertUserSchema, insertStudentSchema, insertMarkSchema, insertSuggestionSchema, students, users, marks, suggestions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        role: z.enum(["admin", "teacher", "student"]),
        username: z.string().optional(),
        password: z.string().optional(),
        name: z.string().optional(),
        class: z.string().optional(),
        dob: z.string().optional(),
      }),
      responses: {
        200: z.object({ user: z.any(), role: z.string() }), // Dynamic based on role
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  admin: {
    getTeachers: {
      method: 'GET' as const,
      path: '/api/admin/teachers',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    createTeacher: {
      method: 'POST' as const,
      path: '/api/admin/teachers',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateTeacher: {
      method: 'PUT' as const,
      path: '/api/admin/teachers/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  teacher: {
    getStudents: {
      method: 'GET' as const,
      path: '/api/teacher/students',
      responses: {
        200: z.array(z.custom<typeof students.$inferSelect>()),
      },
    },
    importStudents: {
      method: 'POST' as const,
      path: '/api/teacher/students/import',
      input: z.object({ csvContent: z.string() }),
      responses: {
        200: z.object({ count: z.number() }),
        400: errorSchemas.validation,
      },
    },
    getMarks: {
      method: 'GET' as const,
      path: '/api/students/:id/marks',
      responses: {
        200: z.array(z.custom<typeof marks.$inferSelect>()),
      },
    },
    updateMarks: {
      method: 'POST' as const,
      path: '/api/students/:id/marks',
      input: z.array(insertMarkSchema),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    addSuggestion: {
      method: 'POST' as const,
      path: '/api/students/:id/suggestions',
      input: insertSuggestionSchema.omit({ studentId: true, teacherId: true }),
      responses: {
        201: z.custom<typeof suggestions.$inferSelect>(),
      },
    },
  },
  student: {
    getData: {
      method: 'GET' as const,
      path: '/api/student/me',
      responses: {
        200: z.object({
          student: z.custom<typeof students.$inferSelect>(),
          marks: z.array(z.custom<typeof marks.$inferSelect>()),
          suggestions: z.array(z.custom<typeof suggestions.$inferSelect>()),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
