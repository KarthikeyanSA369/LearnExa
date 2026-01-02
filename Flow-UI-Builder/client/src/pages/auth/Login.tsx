import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { NeonButton } from "@/components/NeonButton";
import { NeonCard } from "@/components/NeonCard";
import { Lock, User, Calendar, Users, School } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schemas based on role
const teacherSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const adminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const studentSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  class: z.string().min(1, "Class is required (e.g., 10-A)"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export default function Login() {
  const [match, params] = useRoute("/login/:role");
  const role = params?.role as "teacher" | "student" | "admin";
  const { login, isLoggingIn } = useAuth();
  
  // Dynamic form setup
  const form = useForm({
    resolver: zodResolver(
      role === "student" ? studentSchema : 
      role === "admin" ? adminSchema : teacherSchema
    ),
    defaultValues: {
      username: "", password: "", name: "", class: "", dob: ""
    }
  });

  const onSubmit = (data: any) => {
    login({ role, ...data });
  };

  if (!match || !["teacher", "student", "admin"].includes(role)) {
    return <div className="text-white">Invalid role</div>;
  }

  const isStudent = role === "student";
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isAdmin ? 'bg-red-500/5' : isStudent ? 'bg-cyan-500/5' : 'bg-purple-500/5'} blur-[100px] rounded-full`} />
      </div>

      <NeonCard 
        className="w-full max-w-md p-8 relative z-10 backdrop-blur-xl" 
        glowColor={isAdmin ? "none" : isStudent ? "cyan" : "purple"}
      >
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-display font-bold mb-2 ${isAdmin ? 'text-slate-200' : isStudent ? 'text-cyan-400' : 'text-purple-400'}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Login
          </h2>
          <p className="text-slate-500 text-sm">
            {isStudent ? "Enter your academic details to access dashboard" : "Secure authentication required"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!isStudent && (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                          <Input className="pl-10 glass-input" placeholder="Enter username" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                          <Input type="password" className="pl-10 glass-input" placeholder="••••••••" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isStudent && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                          <Input className="pl-10 glass-input" placeholder="John Doe" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Class & Section</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <School className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                          <Input className="pl-10 glass-input" placeholder="10-A" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Date of Birth</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                          <Input type="date" className="pl-10 glass-input block w-full text-slate-200 [color-scheme:dark]" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <NeonButton 
              type="submit" 
              className="w-full mt-4" 
              variant={isStudent ? "secondary" : isAdmin ? "outline" : "primary"}
              isLoading={isLoggingIn}
            >
              Access Dashboard
            </NeonButton>
          </form>
        </Form>
      </NeonCard>
    </div>
  );
}
