"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

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
        const res = await fetch("/api/users?limit=1");
        if (res.ok) {
          const data = await res.json();
          setTotalUsers(data.pagination?.total ?? 0);
        } else {
          setTotalUsers(0);
        }
      } catch {
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchUserCount();
    }
  }, [session]);

  if (isPending) return <p className="text-center mt-8 text-white">در حال بارگذاری...</p>;
  if (!session?.user) return <p className="text-center mt-8 text-white">در حال انتقال...</p>;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      {loading ? (
        <p className="text-muted-foreground">در حال دریافت تعداد کاربران…</p>
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">تعداد کل کاربران</h1>
          <p className="text-6xl font-extrabold">{totalUsers}</p>
        </div>
      )}
    </div>
  );
}