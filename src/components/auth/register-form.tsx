"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User } from "lucide-react";
import { EmailInput } from "@/components/shared/email-input";
import { PasswordInput } from "@/components/shared/password-input";
import { TextInput } from "@/components/shared/text-input";
import { AuthCard } from "./auth-card";
import { useAuth } from "@/hooks/use-auth";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth-schema";

interface RegisterFormProps {
  onToggleMode: () => void;
  isTransitioning: boolean;
}

export function RegisterForm({
  onToggleMode,
  isTransitioning,
}: RegisterFormProps) {
  const { register: registerUser, loading, error, setError } = useAuth();
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setSuccessMsg("");
    const result = await registerUser(data);
    if (result?.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onToggleMode();
        reset();
      }, 2000);
    }
  };

  return (
    <AuthCard isTransitioning={isTransitioning}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-sm font-medium mb-3">
            Buat akun baru untuk mulai menggunakan MindWork
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {(error || successMsg) && (
            <Alert
              variant={error ? "destructive" : "default"}
              className={
                successMsg ? "border-green-500 bg-green-50 text-green-700" : ""
              }
            >
              <AlertDescription>{error || successMsg}</AlertDescription>
            </Alert>
          )}

          <TextInput
            id="fullName"
            label="Nama Lengkap"
            icon={User}
            placeholder="John Doe"
            error={errors.fullName?.message}
            disabled={loading}
            {...register("fullName")}
          />

          <EmailInput
            error={errors.email?.message}
            disabled={loading}
            {...register("email")}
          />

          <PasswordInput
            error={errors.password?.message}
            disabled={loading}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm Password"
            error={errors.confirmPassword?.message}
            disabled={loading}
            {...register("confirmPassword")}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 mt-4">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Daftar
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
            Sudah punya akun? Masuk
          </Button>
        </CardFooter>
      </form>
    </AuthCard>
  );
}
