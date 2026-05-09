"use client";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        isTransitioning && "opacity-0 blur-sm scale-95"
      )}
    >
      {children}
    </Card>
  );
}