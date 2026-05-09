"use client";
import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsTransitioning(false);
    }, 250);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} isTransitioning={isTransitioning} />
      ) : (
        <RegisterForm onToggleMode={toggleMode} isTransitioning={isTransitioning} />
      )}
    </div>
  );
}