import { useLocation } from "wouter";
import { NeonButton } from "@/components/NeonButton";
import { motion } from "framer-motion";
import { GraduationCap, User } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center space-y-8 max-w-2xl px-4"
      >
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-display tracking-wider drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            LearnExa
          </h1>
          <p className="text-xl text-cyan-100/70 font-light tracking-widest uppercase">
            Learning Excellence and Analysis
          </p>
        </div>

        <p className="text-slate-400 max-w-lg mx-auto">
          Welcome to the next generation academic portal. Please select your role to continue.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-lg mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => setLocation("/login/teacher")}
              className="w-full group h-48 bg-[#020617] border border-purple-500/30 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
            >
              <div className="p-4 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <User className="w-10 h-10 text-purple-400" />
              </div>
              <span className="text-xl font-bold text-purple-100 font-display">Teacher</span>
            </button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => setLocation("/login/student")}
              className="w-full group h-48 bg-[#020617] border border-cyan-500/30 hover:border-cyan-500 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
            >
              <div className="p-4 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <GraduationCap className="w-10 h-10 text-cyan-400" />
              </div>
              <span className="text-xl font-bold text-cyan-100 font-display">Student</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
