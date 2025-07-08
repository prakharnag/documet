export const config = {
  // Launch mode configuration
  isLaunchMode: process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true',
  
  // Waitlist configuration
  waitlistUrl: process.env.NEXT_PUBLIC_WAITLIST_URL || '/api/waitlist',
  
  // Feature flags
  features: {
    showLogin: process.env.NEXT_PUBLIC_LAUNCH_MODE !== 'true',
    showDashboard: process.env.NEXT_PUBLIC_LAUNCH_MODE !== 'true',
    showWaitlist: process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true',
  },
  
  // App configuration
  app: {
    name: 'Documet',
    description: 'Turn any document into an interactive AI assistant',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
}; 