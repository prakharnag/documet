import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    home: "/",
    signIn: "/handler/sign-in",
    afterSignIn: "/dashboard",
    signUp: "/register", 
    afterSignUp: "/dashboard",
    afterSignOut: "/",
    handler: "/handler",
  },
  // Ensure proper domain configuration for cookie
});
