import { cn } from "@/lib/utils";

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "cyan" | "purple" | "none";
}

export function NeonCard({ className, glowColor = "cyan", children, ...props }: NeonCardProps) {
  const glowStyles = {
    cyan: "border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(34,211,238,0.1)] hover:border-cyan-400 hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.2)]",
    purple: "border-purple-500/30 shadow-[0_0_15px_-3px_rgba(168,85,247,0.1)] hover:border-purple-400 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.2)]",
    none: "border-slate-800",
  };

  return (
    <div 
      className={cn(
        "bg-[#020617] border rounded-xl transition-all duration-300",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
