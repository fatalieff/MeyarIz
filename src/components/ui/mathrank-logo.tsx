import React from "react";
import { cn } from "@/lib/utils";

interface MathRankLogoProps {
  className?: string;
  size?: number;
}

export function MathRankLogo({ className, size = 44 }: MathRankLogoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#090d16] p-2 text-white shadow-xs",
        className
      )}
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative size-full"
      >
        {/* Subtle mathematical grid coordinate markers */}
        <circle cx="8" cy="8" r="1" fill="#4f46e5" fillOpacity="0.4" />
        <circle cx="36" cy="36" r="1" fill="#4f46e5" fillOpacity="0.4" />

        {/* Ascending Rank Bars */}
        <rect x="9" y="24" width="4.5" height="12" rx="2" fill="#1e1b4b" />
        <rect x="19.75" y="18" width="4.5" height="18" rx="2" fill="#312e81" />
        <rect x="30.5" y="11" width="4.5" height="25" rx="2" fill="#4338ca" />

        {/* Dynamic 'M' + Ascending Growth Trajectory */}
        <path
          d="M 9 36 V 19.5 C 9 17.5 11 16.2 12.8 17.1 L 22 22 L 31.2 10.8 C 32.4 9.4 34.8 10.2 34.8 12 V 36"
          stroke="#6366f1"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak connection line */}
        <path
          d="M 12 17.5 L 22 22.5 L 32 10.5"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex Beacon (Star) */}
        <path
          d="M 33 5 L 34.2 7.2 L 36.5 8.5 L 34.2 9.8 L 33 12 L 31.8 9.8 L 29.5 8.5 L 31.8 7.2 Z"
          fill="#38bdf8"
        />
        <circle cx="33" cy="8.5" r="1" fill="#ffffff" />
      </svg>
    </div>
  );
}
