import { useTeachers, useCreateTeacher, useUpdateTeacher } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { NeonButton } from "@/components/NeonButton";
import { NeonCard } from "@/components/NeonCard";
import { Loader2, Shield, Plus, Edit2, Power, LogOut, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsertUser } from "@shared/routes";

export default function AdminDashboard() {
  const { data: teachers, isLoading } = useTeachers();
  const { logout } = useAuth();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const activeTeachers = teachers?.filter(t => t.isActive).length || 0;
  const deactivatedTeachers = teachers?.filter(t => !t.isActive).length || 0;

  const filteredTeachers = teachers?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-body">
      {/* Admin Nav */}
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-slate-400" />
            <h1 className="font-display font-bold text-xl tracking-wider text-slate-200">ADMIN CONTROL</h1>
          </div>
          <NeonButton variant="outline" onClick={() => logout()} className="h-9 px-4 text-sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </NeonButton>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Teachers" value={teachers?.length || 0} />
          <StatCard title="Active Accounts" value={activeTeachers} color="green" />
          <StatCard title="Deactivated" value={deactivatedTeachers} color="red" />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#020617] p-4 rounded-xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
            <Input 
              className="pl-10 glass-input" 
              placeholder="Search teachers..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <NeonButton variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                Add New Teacher
              </NeonButton>
            </DialogTrigger>
            <DialogContent className="bg-[#020617] border-slate-800 text-slate-200">
              <DialogHeader>
                <DialogTitle className="font-display text-slate-100">Add Teacher</DialogTitle>
              </DialogHeader>
              <TeacherForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Teachers List */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
        ) : (
          <div className="grid gap-4">
            {filteredTeachers?.map(teacher => (
              <TeacherRow key={teacher.id} teacher={teacher} />
            ))}
            {filteredTeachers?.length === 0 && (
              <div className="text-center py-10 text-slate-500">No teachers found.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, color = "default" }: { title: string, value: number, color?: string }) {
  const colors = {
    default: "text-slate-200",
    green: "text-green-400",
    red: "text-red-400"
  };
  return (
    <NeonCard glowColor="none" className="p-6 flex flex-col items-center justify-center gap-2">
      <span className="text-slate-500 text-sm uppercase tracking-widest">{title}</span>
      <span className={`text-4xl font-display font-bold ${colors[color as keyof typeof colors]}`}>{value}</span>
    </NeonCard>
  );
}

function TeacherRow({ teacher }: { teacher: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: update } = useUpdateTeacher();

  const toggleStatus = () => {
    update({ id: teacher.id, isActive: !teacher.isActive });
  };

  return (
    <div className="group bg-[#020617] border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className={`w-2 h-2 rounded-full ${teacher.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
        <div>
          <h3 className="font-bold text-slate-200">{teacher.name}</h3>
          <p className="text-sm text-slate-500">Class: <span className="text-slate-300">{teacher.assignedClass || 'N/A'} - {teacher.assignedSection || 'N/A'}</span></p>
        </div>
      </div>

      <div className="text-sm text-slate-600 font-mono bg-slate-900 px-3 py-1 rounded">{teacher.username}</div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#020617] border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
            </DialogHeader>
            <TeacherForm teacher={teacher} onSuccess={() => setIsEditing(false)} />
          </DialogContent>
        </Dialog>

        <button 
          onClick={toggleStatus}
          className={`p-2 hover:bg-slate-800 rounded transition-colors ${teacher.isActive ? 'text-green-500 hover:text-red-400' : 'text-slate-600 hover:text-green-400'}`}
          title={teacher.isActive ? "Deactivate" : "Activate"}
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TeacherForm({ teacher, onSuccess }: { teacher?: any, onSuccess: () => void }) {
  const { mutate: create, isPending: creating } = useCreateTeacher();
  const { mutate: update, isPending: updating } = useUpdateTeacher();
  const isEditing = !!teacher;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {
      name: formData.get("name"),
      username: formData.get("username"),
      assignedClass: formData.get("class"),
      assignedSection: formData.get("section"),
      role: "teacher"
    };

    const password = formData.get("password") as string;
    if (password) data.password = password;

    if (isEditing) {
      update({ id: teacher.id, ...data });
    } else {
      create(data as InsertUser);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label>Full Name</Label>
        <Input name="name" defaultValue={teacher?.name} required className="glass-input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Class</Label>
          <Input name="class" defaultValue={teacher?.assignedClass} placeholder="e.g. 10" className="glass-input" />
        </div>
        <div className="grid gap-2">
          <Label>Section</Label>
          <Input name="section" defaultValue={teacher?.assignedSection} placeholder="e.g. A" className="glass-input" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Username</Label>
        <Input name="username" defaultValue={teacher?.username} required className="glass-input" />
      </div>
      <div className="grid gap-2">
        <Label>{isEditing ? "New Password (Optional)" : "Password"}</Label>
        <Input name="password" type="password" required={!isEditing} className="glass-input" />
      </div>
      <div className="flex justify-end pt-4">
        <NeonButton type="submit" variant="outline" className="w-full" isLoading={creating || updating}>
          {isEditing ? "Save Changes" : "Create Teacher"}
        </NeonButton>
      </div>
    </form>
  );
}
