import { useStudentMarks, useUpdateMarks, useAddSuggestion, useStudents } from "@/hooks/use-data";
import { NeonButton } from "@/components/NeonButton";
import { NeonCard } from "@/components/NeonCard";
import { Loader2, ArrowLeft, Save, Plus, MessageSquare } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { InsertMark } from "@shared/routes";

const EXAM_TYPES = ["Midterm Test-1", "Quarterly Exam", "Midterm Test-2", "Half-Yearly Exam", "Midterm Test-3", "Annual Exam"];
const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Computer Science"];

export default function StudentDetail() {
  const [match, params] = useRoute("/teacher/student/:id");
  const [, setLocation] = useLocation();
  const studentId = Number(params?.id);
  
  const { data: students } = useStudents();
  const student = students?.find(s => s.id === studentId);
  const { data: marks, isLoading: marksLoading } = useStudentMarks(studentId);
  
  const { mutate: saveMarks, isPending: isSaving } = useUpdateMarks();
  const { mutate: addSuggestion, isPending: isSuggesting } = useAddSuggestion();

  const [localMarks, setLocalMarks] = useState<InsertMark[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [customExam, setCustomExam] = useState("");

  // Initialize local marks state when data loads
  useEffect(() => {
    if (marks) {
      setLocalMarks(marks);
    }
  }, [marks]);

  if (!student) return <div className="p-8 text-white">Loading student...</div>;

  const getMark = (subject: string, exam: string) => {
    return localMarks.find(m => m.subject === subject && m.examName === exam)?.score ?? "";
  };

  const updateMark = (subject: string, exam: string, value: string) => {
    const score = parseInt(value) || 0;
    const existingIndex = localMarks.findIndex(m => m.subject === subject && m.examName === exam);
    
    const newEntry = {
      studentId,
      subject,
      examName: exam,
      score,
      total: 100 // Default total
    };

    if (existingIndex >= 0) {
      const updated = [...localMarks];
      updated[existingIndex] = newEntry;
      setLocalMarks(updated);
    } else {
      setLocalMarks([...localMarks, newEntry]);
    }
  };

  const handleSave = () => {
    saveMarks({ studentId, marks: localMarks });
  };

  const handleSuggestion = () => {
    if (!suggestion.trim()) return;
    addSuggestion({ studentId, content: suggestion }, {
      onSuccess: () => setSuggestion("")
    });
  };

  const allExams = [...EXAM_TYPES, ...Array.from(new Set(localMarks.map(m => m.examName).filter(e => !EXAM_TYPES.includes(e))))];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-body pb-20">
      <nav className="bg-[#22D3EE] text-[#020617] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => setLocation("/teacher/dashboard")} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wider">MARK ENTRY: {student.name.toUpperCase()}</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Student Info */}
        <NeonCard glowColor="purple" className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-500 block">Roll No</span> <span className="text-purple-300 font-mono">{student.rollNumber}</span></div>
            <div><span className="text-slate-500 block">Register No</span> <span className="text-purple-300 font-mono">{student.registerNumber}</span></div>
            <div><span className="text-slate-500 block">Class</span> <span className="text-purple-300">{student.class} - {student.section}</span></div>
            <div><span className="text-slate-500 block">Parent</span> <span className="text-purple-300">{student.parentName}</span></div>
          </div>
        </NeonCard>

        {/* Marks Table */}
        {marksLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display text-cyan-400">Academic Performance</h2>
              <div className="flex gap-2">
                <Input 
                  placeholder="New Exam Name..." 
                  value={customExam} 
                  onChange={e => setCustomExam(e.target.value)}
                  className="w-48 glass-input h-9"
                />
                <button 
                  onClick={() => { if(customExam) { allExams.push(customExam); setCustomExam(""); } }}
                  className="bg-purple-600 px-3 rounded text-white text-sm hover:bg-purple-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-purple-500/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-900/20 text-purple-200">
                    <th className="p-4 border-b border-purple-500/30 sticky left-0 bg-[#0F172A] z-10">Subject</th>
                    {allExams.map(exam => (
                      <th key={exam} className="p-4 border-b border-purple-500/30 min-w-[100px] text-center">{exam}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map(subject => (
                    <tr key={subject} className="border-b border-purple-500/10 hover:bg-white/5">
                      <td className="p-4 font-medium text-slate-300 sticky left-0 bg-[#0F172A] border-r border-purple-500/30">
                        {subject}
                      </td>
                      {allExams.map(exam => (
                        <td key={exam} className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 bg-transparent border border-slate-700 rounded text-center text-cyan-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            value={getMark(subject, exam)}
                            onChange={(e) => updateMark(subject, exam, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <NeonButton onClick={handleSave} isLoading={isSaving} variant="primary" className="shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <Save className="w-4 h-4 mr-2" />
                Save Marks
              </NeonButton>
            </div>
          </div>
        )}

        {/* Suggestion Box */}
        <div className="grid gap-4 max-w-2xl">
          <h2 className="text-xl font-display text-cyan-400 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Teacher Suggestion Box
          </h2>
          <NeonCard glowColor="cyan" className="p-4 space-y-4">
            <textarea
              className="w-full bg-[#0F172A] border border-cyan-500/30 rounded-lg p-3 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-0 min-h-[100px]"
              placeholder="Write specific improvements suggestions or tasks for this student..."
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
            />
            <div className="flex justify-end">
              <NeonButton onClick={handleSuggestion} isLoading={isSuggesting} variant="secondary" className="px-8">
                Post Suggestion
              </NeonButton>
            </div>
          </NeonCard>
        </div>

      </main>
    </div>
  );
}
