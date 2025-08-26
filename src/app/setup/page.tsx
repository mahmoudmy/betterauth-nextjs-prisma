"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/auth-client";

export default function SetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateAdmin() {
    try {
      setIsLoading(true);
      setError(null);

      const res = await signUp.email({
        name: "Administrator",
        email: "admin@example.com",
        username: "admin",
        password: "admin",
      });

      if (res.error) {
        setError(res.error.message || "Something went wrong.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Create your first user</CardTitle>
            <CardDescription>
              Set up the initial administrator account to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateAdmin} disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Admin"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}