"use client";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AuthCardProps {
  children: ReactNode;
  isTransitioning: boolean;
}

export function AuthCard({ children, isTransitioning }: AuthCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md shadow-xl border-0 rounded-2xl overflow-hidden",
        "transition-all duration-300 ease-in-out",
        isTransitioning && "opacity-0 blur-sm scale-95",
      )}
    >
      <div className="text-center pt-6">
        <div className="relative w-15 h-15 mx-auto mb-4">
          <Image
            src="/logo/mindwork.png"
            alt="MindWork Logo"
            fill
            className="object-contain rounded-xl"
            loading="eager"
          />
        </div>
      </div>
      {children}
    </Card>
  );
}
