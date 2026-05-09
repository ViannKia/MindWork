"use client";
import { forwardRef, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showForgot?: boolean;
  label?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { error, className, disabled, showForgot, label = "Password", ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold">
            {label}
          </Label>
          {showForgot && (
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-foreground/700 transition-colors cursor-pointer"
              onClick={() => alert("Fitur lupa password segera hadir!")}
            >
              Lupa password?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            className={cn(
              "pl-9 pr-9 py-3 rounded-xl",
              error && "border-red-500",
              className,
            )}
            disabled={disabled}
            ref={ref}
            autoComplete="new-password"
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
