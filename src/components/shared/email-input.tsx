"use client";
import { forwardRef } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ error, className, disabled, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            className={cn("pl-9 py-3 rounded-xl", error && "border-red-500", className)}
            disabled={disabled}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";