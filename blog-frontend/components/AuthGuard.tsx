"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasTokens } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!hasTokens()) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">验证中...</p>
      </div>
    );
  }

  return <>{children}</>;
}
