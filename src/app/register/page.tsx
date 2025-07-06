'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@stackframe/stack";

export default function RegisterPage() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.replace('/dashboard');
      return;
    }

    // If not authenticated, redirect to Stack Auth sign-up
    router.replace('/handler/sign-up');
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-gray-600">Redirecting to secure registration...</div>
    </div>
  );
} 