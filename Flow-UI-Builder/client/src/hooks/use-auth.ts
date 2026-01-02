import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LoginRequest } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Simple auth state management via localStorage for MVP, or just rely on API sessions
// In a real app, we'd use a context provider. Here we use basic mutations.

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      return await res.json(); // Returns { user, role }
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.role}`,
      });
      
      // Redirect based on role
      if (data.role === "admin") setLocation("/admin/dashboard");
      else if (data.role === "teacher") setLocation("/teacher/dashboard");
      else if (data.role === "student") setLocation("/student/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Access Denied",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    },
    onSuccess: () => {
      setLocation("/");
      toast({ title: "Logged out successfully" });
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
