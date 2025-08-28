"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch("/api/users/count");
        if (res.ok) {
          const data = await res.json();
          setTotalUsers(data.count ?? 0);
        } else {
          setTotalUsers(0);
        }
      } catch {
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && session.user.role === "admin") {
      fetchUserCount();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (isPending) return <p className="text-center mt-8 text-white">در حال بارگذاری...</p>;
  if (!session?.user) return <p className="text-center mt-8 text-white">در حال انتقال...</p>;

  const isAdmin = session.user.role === "admin";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">داشبورد</h1>
        <p className="text-muted-foreground">خوش آمدید، {session.user.name}</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Count Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد کل کاربران</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <div className="text-2xl font-bold">{totalUsers}</div>
              )}
              <p className="text-xs text-muted-foreground">
                کاربران ثبت شده در سیستم
              </p>
            </CardContent>
          </Card>

        </div>
      )}

      {!isAdmin && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2">داشبورد کاربری</h1>
            <p className="text-muted-foreground">به پنل کاربری خود خوش آمدید</p>
          </div>
        </div>
      )}
    </div>
  );
}