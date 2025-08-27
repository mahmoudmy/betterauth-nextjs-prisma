import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function AuthGuard({ children, fallback }: AuthGuardProps) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      if (fallback) {
        return fallback;
      }
      redirect("/login");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Auth check failed:", error);
    if (fallback) {
      return fallback;
    }
    redirect("/login");
  }
}
