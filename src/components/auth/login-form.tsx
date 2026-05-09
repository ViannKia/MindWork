"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { EmailInput } from "@/components/shared/email-input";
import { PasswordInput } from "@/components/shared/password-input";
import { AuthCard } from "./auth-card";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schema";

interface LoginFormProps {
  onToggleMode: () => void;
  isTransitioning: boolean;
}

export function LoginForm({ onToggleMode, isTransitioning }: LoginFormProps) {
  const { login, loading, error, setError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await login(data);

    if (result.success) {
      // Login sukses
      window.location.href = "/dashboard";
    } else {
      // Login gagal, kasih pesan error
      setError(result.message ?? null);
    }
  };
  return (
    <AuthCard isTransitioning={isTransitioning}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Sign In
          </CardTitle>
          <CardDescription className="text-sm font-medium mb-3">
            Gunakan akun yang sudah terdaftar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-center">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <EmailInput
            error={errors.email?.message}
            disabled={loading}
            {...register("email")}
          />

          <PasswordInput
            error={errors.password?.message}
            disabled={loading}
            showForgot
            {...register("password")}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 mt-4">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Masuk
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground font-medium">
                Atau
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full font-semibold py-3 rounded-xl transition-all hover:bg-muted/30 duration-200 transform hover:scale-[1.02]"
            onClick={onToggleMode}
            disabled={loading}
          >
            Belum punya akun? Daftar
          </Button>
        </CardFooter>
      </form>
    </AuthCard>
  );
}
