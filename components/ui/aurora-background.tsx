"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn("relative w-full min-h-screen", className)}
      style={{ 
        background: "#F5F0E8",
        position: "relative",
        overflow: "hidden"
      }}
      {...props}
    >
      {/* Aurora effect layer - lowest z-index */}
      <div 
        className="aurora-layer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-10px",
            opacity: 0.25, // Reduced from 0.6 to 0.25 for more subtle effect
            backgroundImage: `repeating-linear-gradient(100deg, #F5F0E8 0%, #F5F0E8 7%, transparent 10%, transparent 12%, #F5F0E8 16%),
                              repeating-linear-gradient(100deg, #E8573A 10%, #F9A26C 15%, #E8573A 20%, #F9A26C 25%, #D04A2E 30%)`,
            backgroundSize: "300%, 200%",
            backgroundPosition: "50% 50%, 50% 50%",
            filter: "blur(20px)", // Increased blur from 10px to 20px for softer effect
            animation: "auroraMove 60s linear infinite",
            ...(showRadialGradient && {
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 95%)", // Adjusted for more subtle fade
              WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 95%)",
            }),
          }}
        />
      </div>
      
      {/* Content layer - higher z-index */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>

      <style jsx global>{`
        @keyframes auroraMove {
          from {
            background-position: 50% 50%, 50% 50%;
          }
          to {
            background-position: 350% 50%, 350% 50%;
          }
        }
      `}</style>
    </div>
  );
};