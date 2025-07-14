'use client';

import { Button } from "@/components/ui/button";
import { Upload, Clock, Star, MessageSquare, Bot, DollarSign, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";
import ChromeWindow from "@/components/ChromeWindow";
import WaitlistForm from "@/components/WaitlistForm";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Fixed, layered gradient background with blurred shapes */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#f5f1eb] via-[#ede4d3] to-[#e6d7c3]">
        <div className="absolute top-10 left-10 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-300/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo size="xl" />
            <div className="hidden md:flex items-center gap-3">
              <Button variant="default" size="sm" className="rounded-full shadow-md px-6 py-2 font-semibold text-base bg-gradient-to-r from-orange-600 to-amber-600 text-white" onClick={() => router.push('/handler/sign-in')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-screen py-24">
        <div className="max-w-4xl w-full mx-auto px-8 py-12 flex flex-col items-center gap-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent text-center">
            Conversational AI Assistant for your document
          </h1>
          <p className="text-lg md:text-2xl text-stone-700 mt-4 text-center">
            Upload any document and let AI handle questions, explanations, and support for your team, clients, or anyone, 24/7.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button
              className="px-8 py-3 rounded-full shadow-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-lg hover:scale-105 transition-transform"
              onClick={() => router.push('/login')}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Document & Get Started
            </Button>
            <Button variant="outline" size="lg" className="rounded-full border-orange-600 text-orange-700 hover:bg-orange-100/50 font-semibold text-lg shadow-md">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-stone-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Free to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          See Documet in Action
        </h2>
        <ChromeWindow>
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-orange-50 to-amber-50">
            <span className="text-2xl md:text-3xl font-semibold text-stone-700 mb-2">Demo Coming Soon</span>
            <span className="text-stone-600">You&apos;ll see how to upload, chat, and share with your AI assistant!</span>
          </div>
        </ChromeWindow>
        <p className="mt-6 text-lg text-stone-600 text-center max-w-2xl">
          See how easy it is to upload a document, create your AI assistant, and share it so others can ask questions and get answers directly from the document.
        </p>
      </section>

      {/* Who is this for Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <MessageSquare className="w-10 h-10 text-orange-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2 text-stone-800">Support Teams</h3>
              <p className="text-stone-600 text-center">Provide instant, accurate answers to customers, 24/7.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <Bot className="w-10 h-10 text-amber-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2 text-stone-800">Internal Teams</h3>
              <p className="text-stone-600 text-center">Centralize knowledge and reduce repetitive questions.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <Star className="w-10 h-10 text-green-400 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2 text-stone-800">Job Seekers & Students</h3>
              <p className="text-stone-600 text-center">Turn your resume or notes into an interactive, always-available expert.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <DollarSign className="w-10 h-10 text-emerald-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2 text-stone-800">Finance</h3>
              <p className="text-stone-600 text-center">Instantly extract insights from financial statements and compliance reports.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <Scale className="w-10 h-10 text-blue-600 mb-4 animate-bounce" />
              <h3 className="font-bold text-lg mb-2 text-stone-800">Legal</h3>
              <p className="text-stone-600 text-center">Quickly find clauses and case law in lengthy contracts and filings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-orange-200 backdrop-blur-md">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-stone-600 text-sm text-center">
              Transforming documents into intelligent AI assistants for better knowledge sharing and connections.
            </p>
            <p className="text-center text-stone-500">© 2025 Documet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;