'use client';

import { Button } from "@/components/ui/button";
import { Upload, Sparkles, ArrowRight, Clock, Star, MessageSquare, Bot, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo size="xl" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button className="text-gray-600 hover:text-gray-900 transition-colors bg-transparent border-none outline-none cursor-pointer" onClick={() => scrollToSection('cta')}>
                How It Works
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors bg-transparent border-none outline-none cursor-pointer" onClick={() => scrollToSection('benefits')}>
                Benefits
              </button>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">
                Demo
              </a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="default" size="sm" onClick={() => router.push('/handler/sign-in')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden pt-16">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Turn Your Document Into an
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Assistant</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Upload your document and let AI handle questions, explanations, and support for your team, clients, or anyone - 24/7.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="group" onClick={() => router.push('/login')}>
                  <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Upload Document & Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-8 text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Free to get started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Setup in 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Right content - Hero Image Placeholder */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Sparkles className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">AI Document Assistant</h3>
                    <p className="text-blue-100">Your intelligent document companion</p>
                  </div>
                </div>
              </div>
              
              {/* Floating AI elements */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">AI Assistant Active</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Always Available</div>
                  <div className="text-lg font-bold text-blue-600">24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Documet?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionizing how people share knowledge and connect through intelligent document conversations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Transform any document into an AI assistant
                </h3>
                <p className="text-gray-600">
                  Give anyone a modern, interactive way to learn about your content, services, or information
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center group">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <benefit.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>

              <div className="text-center pt-8">
                <Button variant="hero" size="lg" onClick={() => router.push('/login')}>
                  Create My AI Document Assistant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyLjUiIGN5PSIyLjUiIHI9IjIuNSIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Ready to revolutionize your document sharing?
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Create Your AI Document Assistant Today
              </h2>

              {/* Workflow Steps */}
              <div className="flex justify-center py-4">
                <ol className="flex items-center gap-6 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">1</span>
                    <span className="text-gray-800">Upload Document PDF</span>
                  </li>
                  <span className="w-6 h-0.5 bg-blue-200 rounded-full" />
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">2</span>
                    <span className="text-gray-800">Documet creates AI assistant</span>
                  </li>
                  <span className="w-6 h-0.5 bg-blue-200 rounded-full" />
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white font-bold">3</span>
                    <span className="text-gray-800">Share with Anyone</span>
                  </li>
                </ol>
              </div>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform your document into an AI assistant that works for you around the clock. 
                Setup takes less than 2 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group shadow-xl" onClick={() => router.push('/login')}>
                <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Upload document & Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Free to get started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-1 gap-8">
            {/* Brand */}
            <div className="space-y-4 text-center">
              <p className="text-gray-600 text-sm">
                Transforming documents into intelligent AI assistants for better knowledge sharing and connections.
              </p>
              <p>© 2024 Documet. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 