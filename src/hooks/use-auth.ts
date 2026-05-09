import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AUTH_DELAY_MS } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth-schema";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    
    try {
      // Delay hanya di development (simulasi network request)
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
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    
    try {
      // Delay hanya di development
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
      
      return { success: true, message: "✅ Pendaftaran berhasil! Silakan cek email untuk verifikasi." };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error, setError };
}