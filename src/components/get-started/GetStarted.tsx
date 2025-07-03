'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const GetStarted = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <Button variant="hero" size="lg" onClick={handleGetStarted}>
      Get Started
    </Button>
  );
};

export default GetStarted;