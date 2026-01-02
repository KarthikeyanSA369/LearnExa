import { useStudentData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { NeonCard } from "@/components/NeonCard";
import { Loader2, LogOut, TrendingUp, Trophy, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useState } from "react";
import { clsx } from "clsx";

// Helper to calculate totals and grades
const calculateStats = (marks: any[]) => {
  if (!marks?.length) return { exams: [], overall: 0, subjects: {} };

  const exams: any = {};
  const subjects: any = {};
  
  marks.forEach(m => {
    // Exam totals
    if (!exams[m.examName]) exams[m.examName] = { total: 0, count: 0, max: 0 };
    exams[m.examName].total += m.score;
    exams[m.examName].count += 1;
    exams[m.examName].max += m.total;

    // Subject performance
    if (!subjects[m.subject]) subjects[m.subject] = { total: 0, count: 0 };
    subjects[m.subject].total += m.score;
    subjects[m.subject].count += 1;
  });

  const examStats = Object.keys(exams).map(name => ({
    name,
    percentage: Math.round((exams[name].total / exams[name].max) * 100)
  }));

  const subjectStats = Object.keys(subjects).map(name => ({
    name,
    avg: Math.round(subjects[name].total / subjects[name].count),
    status: subjects[name].total / subjects[name].count >= 80 ? 'strong' 
          : subjects[name].total / subjects[name].count >= 60 ? 'average' : 'weak'
  }));

  const overallAvg = subjectStats.reduce((acc, curr) => acc + curr.avg, 0) / (subjectStats.length || 1);

  return { exams: examStats, overall: overallAvg, subjects: subjectStats };
};

export default function StudentDashboard() {
  const { data, isLoading } = useStudentData();
  const { logout } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#0F172A]"><Loader2 className="w-10 h-10 text-cyan-400 animate-spin" /></div>;
  if (!data) return null;

  const { student, marks, suggestions } = data;
  const stats = calculateStats(marks);

  const getRankLevel = (avg: number) => {
    if (avg >= 90) return { label: "Top Performer", color: "text-purple-400", icon: Trophy };
    if (avg >= 75) return { label: "Excellent", color: "text-cyan-400", icon: Star };
    if (avg >= 50) return { label: "Improving", color: "text-yellow-400", icon: TrendingUp };
    return { label: "Beginner", color: "text-slate-400", icon: AlertCircle };
  };

  const rank = getRankLevel(stats.overall);
  const RankIcon = rank.icon;

  const uniqueSubjects = Array.from(new Set(marks.map(m => m.subject)));

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-body pb-20">
      
      {/* Top Section */}
      <header className="bg-gradient-to-b from-[#020617] to-[#0F172A] border-b border-cyan-900 p-6 md:p-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Welcome, {student.name.split(' ')[0]}
            </h1>
            <div className="flex gap-4 text-sm text-slate-400 mt-2">
              <span className="px-2 py-0.5 border border-cyan-500/30 rounded text-cyan-300">{student.class} - {student.section}</span>
              <span>Parent: {student.parentName}</span>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-8 space-y-8">
        
        {/* Score Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.exams.slice(0, 4).map((exam, i) => (
            <NeonCard key={i} glowColor="cyan" className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">{exam.name}</span>
              <span className="text-3xl font-display font-bold text-cyan-400">{exam.percentage}%</span>
            </NeonCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Subject Performance Bars */}
            <div className="space-y-4">
              <h3 className="text-xl font-display text-purple-300">Subject Proficiency</h3>
              <div className="bg-[#020617] p-6 rounded-xl border border-slate-800 space-y-6">
                {stats.subjects.map(sub => (
                  <div key={sub.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{sub.name}</span>
                      <span className={clsx(
                        sub.status === 'strong' ? 'text-green-400' : 
                        sub.status === 'average' ? 'text-yellow-400' : 'text-red-400'
                      )}>{sub.avg}% ({sub.status})</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          "h-full rounded-full transition-all duration-1000",
                          sub.status === 'strong' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                          sub.status === 'average' ? 'bg-yellow-500 shadow-[0_0_10px_#facc15]' : 'bg-red-500 shadow-[0_0_10px_#f43f5e]'
                        )}
                        style={{ width: `${sub.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-display text-cyan-300">Detailed Heatmap</h3>
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {uniqueSubjects.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub === selectedSubject ? null : sub)}
                      className={clsx(
                        "px-4 py-2 rounded border font-medium transition-all duration-300",
                        selectedSubject === sub 
                          ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          : "bg-[#020617] text-cyan-100 border-purple-500/50 hover:border-cyan-400"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {marks
                    .filter(m => !selectedSubject || m.subject === selectedSubject)
                    .map((mark, i) => {
                      const pct = (mark.score / mark.total) * 100;
                      const color = pct >= 80 ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                                : pct >= 60 ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                                : 'bg-red-500 border-red-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
                      
                      return (
                        <div key={i} className={`p-3 rounded-lg border text-center ${color} bg-opacity-10 backdrop-blur-sm`}>
                          <div className="text-[10px] text-slate-300 mb-1 truncate">{mark.examName}</div>
                          <div className="font-bold text-white text-lg">{mark.score}</div>
                          {selectedSubject ? null : <div className="text-[10px] text-slate-400 mt-1 truncate">{mark.subject}</div>}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar (1/3) */}
          <div className="space-y-8">
            
            {/* Rank Card */}
            <NeonCard glowColor="purple" className="p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
              <div className="relative z-10">
                <RankIcon className={`w-16 h-16 mx-auto mb-4 ${rank.color}`} />
                <h3 className="text-2xl font-display font-bold text-white mb-1">{rank.label}</h3>
                <p className="text-slate-500 text-sm">Overall Performance Level</p>
                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <div className="text-4xl font-bold text-purple-400 font-display">{stats.overall.toFixed(1)}%</div>
                  <div className="text-xs text-purple-300/50 uppercase tracking-widest mt-1">Class Average</div>
                </div>
              </div>
            </NeonCard>

            {/* Suggestions */}
            <div className="space-y-4">
              <h3 className="text-xl font-display text-cyan-300">Teacher's Remarks</h3>
              <div className="space-y-4">
                {suggestions.length === 0 ? (
                  <div className="text-center p-8 border border-slate-800 rounded-xl text-slate-500">
                    No suggestions yet. Keep up the good work!
                  </div>
                ) : (
                  suggestions.map((sug, i) => (
                    <div key={i} className="bg-[#020617] border border-cyan-500/50 p-4 rounded-xl relative shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                      <div className="absolute top-4 left-4 w-1 h-full bg-cyan-500/50 rounded-full" />
                      <p className="text-cyan-50 pl-2 text-sm leading-relaxed">{sug.content}</p>
                      <div className="text-xs text-cyan-500/50 mt-3 text-right">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Greeting */}
        <div className="mt-12 py-8 text-center border-t border-slate-800">
          <h2 className="text-2xl font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 animate-pulse">
            "Keep pushing forward! Your progress matters and improvement is always possible 🌟"
          </h2>
        </div>

      </main>
    </div>
  );
}
