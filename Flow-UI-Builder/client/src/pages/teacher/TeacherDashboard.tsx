import { useStudents, useImportStudents } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { NeonButton } from "@/components/NeonButton";
import { NeonCard } from "@/components/NeonCard";
import { Loader2, LogOut, Upload, Users, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TeacherDashboard() {
  const { data: students, isLoading } = useStudents();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-body">
      <nav className="bg-[#22D3EE] text-[#020617] sticky top-0 z-50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h1 className="font-display font-bold text-xl tracking-wider">TEACHER PORTAL</h1>
          </div>
          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 px-4 py-1.5 bg-[#020617]/10 hover:bg-[#020617]/20 rounded-full transition-colors text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-purple-500/20 pb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Class Overview</h2>
            <p className="text-slate-400 mt-2">Manage student performance and suggestions</p>
          </div>
          <ImportStudentsDialog />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students?.map(student => (
              <NeonCard 
                key={student.id} 
                glowColor="purple"
                className="group cursor-pointer hover:-translate-y-1 transition-transform"
                onClick={() => setLocation(`/teacher/student/${student.id}`)}
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xl border border-purple-500/30">
                      {student.rollNumber}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg text-purple-50">{student.name}</h3>
                    <p className="text-sm text-slate-500">Reg: {student.registerNumber}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between text-sm text-slate-400">
                    <span>Parent: {student.parentName.split(' ')[0]}</span>
                    <span className="text-purple-400 font-medium group-hover:underline">View Details</span>
                  </div>
                </div>
              </NeonCard>
            ))}
            
            {students?.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500">No students found. Import a CSV to get started.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ImportStudentsDialog() {
  const { mutate: importStudents, isPending } = useImportStudents();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importStudents(content, {
        onSuccess: () => {
          setOpen(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NeonButton variant="primary" className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </NeonButton>
      </DialogTrigger>
      <DialogContent className="bg-[#020617] border-purple-500/30 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-purple-400 font-display">Import Students CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-900/50 rounded border border-slate-800 text-sm text-slate-400 font-mono">
            Expected Format:<br/>
            name,class,section,roll_number,register_number,parent_name,address,dob (YYYY-MM-DD)
          </div>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-500/30 border-dashed rounded-lg cursor-pointer hover:bg-purple-500/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isPending ? (
                  <Loader2 className="w-8 h-8 mb-3 text-purple-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-purple-500" />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleFile} 
                ref={fileInputRef}
                disabled={isPending}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
