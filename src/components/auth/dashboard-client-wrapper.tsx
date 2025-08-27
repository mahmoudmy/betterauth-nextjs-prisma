"use client";

import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface DashboardClientWrapperProps {
  children: React.ReactNode;
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session?.user) {
    return <div>Redirecting...</div>;
  }

  return <>{children}</>;
}
