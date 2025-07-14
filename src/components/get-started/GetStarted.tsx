'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const GetStarted = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/handler/sign-in');
  };

  return (
    <Button variant="hero" size="lg" onClick={handleGetStarted}>
      Sign In
    </Button>
  );
};

export default GetStarted;