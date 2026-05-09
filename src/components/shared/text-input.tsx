"use client";
import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, icon: Icon, error, className, disabled, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            type="text"
            placeholder={props.placeholder}
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

TextInput.displayName = "TextInput";