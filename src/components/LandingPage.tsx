'use client';

import { Button } from "@/components/ui/button";
import { Upload, Sparkles, ArrowRight, Clock, Star, MessageSquare, Bot, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";
import ChromeWindow from "@/components/ChromeWindow";
import WaitlistForm from "@/components/WaitlistForm";
import { config } from "@/lib/config";

const LandingPage = () => {
  const router = useRouter();

  const benefits = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Your AI assistant works around the clock, answering questions and providing support even when you're unavailable."
    },
    {
      icon: MessageSquare,
      title: "Instant Responses",
      description: "Anyone gets immediate, accurate answers about your content, services, or information."
    },
    {
      icon: Star,
      title: "Consistent Messaging",
      description: "Never worry about inconsistent communication. Your AI maintains your brand voice and messaging."
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Fixed, layered gradient background with blurred shapes */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-100 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo size="xl" />
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {config.isLaunchMode ? (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="rounded-full shadow-md px-6 py-2 font-semibold text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 transition-transform"
                  onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Join Waitlist
                </Button>
              ) : (
                <Button variant="default" size="sm" className="rounded-full shadow-md px-6 py-2 font-semibold text-base" onClick={() => router.push('/handler/sign-in')}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[80vh] py-24">
        <div className="max-w-4xl w-full mx-auto px-8 py-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Conversational AI Assistant for your document
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 mt-4 text-center">
            Upload any document and let AI handle questions, explanations, and support for your team, clients, or anyone, 24/7.
          </p>
          
          {config.isLaunchMode ? (
            <div className="w-full max-w-md">
              <WaitlistForm 
                buttonText="Join the Waitlist"
                placeholder="Enter your email to get early access"
                className="mt-6"
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                className="px-8 py-3 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:scale-105 transition-transform"
                onClick={() => router.push('/login')}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Document & Get Started
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-lg shadow-md">
                Watch Demo
              </Button>
            </div>
          )}
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Free to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          See Documet in Action
        </h2>
        <ChromeWindow>
          {/* Placeholder: Replace with <video> when ready */}
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">Demo Coming Soon</span>
            <span className="text-gray-500">You'll see how to upload, chat, and share with your AI assistant!</span>
          </div>
        </ChromeWindow>
        <p className="mt-6 text-lg text-gray-700 text-center max-w-2xl">
          Watch how easy it is to upload a document, create your AI assistant, chat with it, and share conversations with others.
        </p>
      </section>

      {/* Who is this for Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
              <MessageSquare className="w-10 h-10 text-blue-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2">Support Teams</h3>
              <p className="text-gray-600 text-center">Provide instant, accurate answers to customers, 24/7.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
              <Bot className="w-10 h-10 text-purple-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2">Internal Teams</h3>
              <p className="text-gray-600 text-center">Centralize knowledge and reduce repetitive questions.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
              <Star className="w-10 h-10 text-green-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2">Job Seekers & Students</h3>
              <p className="text-gray-600 text-center">Turn your resume or notes into an interactive, always-available expert.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section (only in launch mode) */}
      {config.isLaunchMode && (
        <section id="waitlist" className="py-16 flex flex-col items-center">
          <div className="max-w-2xl w-full mx-auto px-8 py-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Be First to Try Documet
            </h2>
            <p className="text-lg text-gray-700 text-center">
              Join our exclusive waitlist and get early access to the future of document sharing. 
              We'll notify you as soon as we launch!
            </p>
            <WaitlistForm 
              showName={true}
              buttonText="Join the Waitlist"
              placeholder="Enter your email address"
              className="w-full"
            />
            <p className="text-sm text-gray-500 text-center">
              No spam, ever. We'll only email you about Documet updates and early access.
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white/60 border-t border-gray-100 backdrop-blur-md">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-gray-600 text-sm text-center">
              Transforming documents into intelligent AI assistants for better knowledge sharing and connections.
            </p>
            <p className="text-center">© 2025 Documet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 