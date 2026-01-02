import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import Welcome from "@/pages/Welcome";
import Login from "@/pages/auth/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import StudentDetail from "@/pages/teacher/StudentDetail";
import StudentDashboard from "@/pages/student/StudentDashboard";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Welcome} />
      <Route path="/login/:role" component={Login} />
      <Route path="/admin/login">
        <Redirect to="/login/admin" />
      </Route>

      {/* Protected Routes - In a real app we'd wrap these with auth guards */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      <Route path="/teacher/dashboard" component={TeacherDashboard} />
      <Route path="/teacher/student/:id" component={StudentDetail} />
      
      <Route path="/student/dashboard" component={StudentDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
