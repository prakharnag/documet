'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Directly redirect to Stack Auth sign-in
    router.replace('/handler/sign-in');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-gray-600">Redirecting to secure login...</div>
    </div>
  );
}