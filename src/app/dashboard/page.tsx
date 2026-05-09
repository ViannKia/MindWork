"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600">
              <span className="text-lg">🧠</span>
            </div>
            <h1 className="text-2xl font-bold">MindWork</h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Selamat datang di dashboard MindWork
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Email: {user?.email}
              </p>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                Status: ✅ Terautentikasi
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Dashboard masih dalam pengembangan. Fitur-fitur menarik akan
              segera hadir!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
