import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertUser, type InsertMark, type InsertSuggestion } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ================= ADMIN HOOKS =================
export function useTeachers() {
  return useQuery({
    queryKey: [api.admin.getTeachers.path],
    queryFn: async () => {
      const res = await fetch(api.admin.getTeachers.path);
      if (!res.ok) throw new Error("Failed to fetch teachers");
      return await res.json();
    },
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.admin.createTeacher.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create teacher");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.getTeachers.path] });
      toast({ title: "Success", description: "Teacher account created" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertUser> & { id: number }) => {
      const url = buildUrl(api.admin.updateTeacher.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update teacher");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.getTeachers.path] });
      toast({ title: "Success", description: "Teacher updated" });
    },
  });
}

// ================= TEACHER HOOKS =================
export function useStudents() {
  return useQuery({
    queryKey: [api.teacher.getStudents.path],
    queryFn: async () => {
      const res = await fetch(api.teacher.getStudents.path);
      if (!res.ok) throw new Error("Failed to fetch students");
      return await res.json();
    },
  });
}

export function useStudentMarks(studentId: number) {
  return useQuery({
    queryKey: [api.teacher.getMarks.path, studentId],
    queryFn: async () => {
      const url = buildUrl(api.teacher.getMarks.path, { id: studentId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch marks");
      return await res.json();
    },
    enabled: !!studentId,
  });
}

export function useUpdateMarks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ studentId, marks }: { studentId: number, marks: InsertMark[] }) => {
      const url = buildUrl(api.teacher.updateMarks.path, { id: studentId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marks),
      });
      if (!res.ok) throw new Error("Failed to save marks");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.teacher.getMarks.path, variables.studentId] });
      toast({ title: "Saved", description: "Marks updated successfully" });
    },
  });
}

export function useAddSuggestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ studentId, content }: { studentId: number, content: string }) => {
      const url = buildUrl(api.teacher.addSuggestion.path, { id: studentId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add suggestion");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Sent", description: "Suggestion added to student dashboard" });
    },
  });
}

export function useImportStudents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (csvContent: string) => {
      const res = await fetch(api.teacher.importStudents.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });
      if (!res.ok) throw new Error("Failed to import students");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.teacher.getStudents.path] });
      toast({ title: "Import Successful", description: `Added ${data.count} students.` });
    },
  });
}

// ================= STUDENT HOOKS =================
export function useStudentData() {
  return useQuery({
    queryKey: [api.student.getData.path],
    queryFn: async () => {
      const res = await fetch(api.student.getData.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load dashboard");
      return await res.json();
    },
    retry: false,
  });
}
