import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "primary", isLoading, children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-bold transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-transparent focus:ring-purple-500",
      secondary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-transparent focus:ring-cyan-400",
      outline: "bg-transparent text-cyan-300 border border-cyan-500 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] focus:ring-cyan-400",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
NeonButton.displayName = "NeonButton";
