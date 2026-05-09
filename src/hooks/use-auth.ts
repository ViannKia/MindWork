import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AUTH_DELAY_MS } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth-schema";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHumanReadableMessage = (message: string): string => {
    const errorMap: Record<string, string> = {
      "User already registered": "Email sudah terdaftar.",
      "Invalid login credentials": "Email atau password salah.",
      "Password should be at least 6 characters": "Password minimal 6 karakter.",
      "Email not confirmed": "Email belum diverifikasi. Silakan cek inbox Anda.",
    };
    
    return errorMap[message] || message;
  };

  const login = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    
    try {
      if (AUTH_DELAY_MS > 0) {
        await new Promise(resolve => setTimeout(resolve, AUTH_DELAY_MS));
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      
      window.location.href = "/dashboard";
      return { success: true };
    } catch (err: any) {
      const humanMessage = getHumanReadableMessage(err.message);
      setError(humanMessage);
      return { success: false, message: humanMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    
    try {
      if (AUTH_DELAY_MS > 0) {
        await new Promise(resolve => setTimeout(resolve, AUTH_DELAY_MS));
      }
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
        },
      });
      if (error) throw error;
      
      return { success: true, message: "Pendaftaran berhasil! Silakan cek email untuk verifikasi." };
    } catch (err: any) {
      const humanMessage = getHumanReadableMessage(err.message);
      setError(humanMessage);
      return { success: false, message: humanMessage };
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error, setError };
}