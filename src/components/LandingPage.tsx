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
        <div className="absolute top-10 left-10 w-48 h-48 md:w-96 md:h-96 bg-orange-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-amber-300/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Logo size="lg" />
            <div className="hidden md:flex items-center gap-3">
              <Button variant="default" size="sm" className="rounded-full shadow-md px-6 py-2 font-semibold text-base bg-gradient-to-r from-orange-600 to-amber-600 text-white" onClick={() => router.push('/handler/sign-in')}>
                Sign In
              </Button>
            </div>
            {/* Mobile Sign In Button */}
            <div className="flex md:hidden items-center">
              <Button
                variant="default"
                size="sm"
                className="rounded-full shadow-md px-4 py-2 font-semibold text-sm bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                onClick={() => router.push('/handler/sign-in')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen pt-20 pb-8 px-4 sm:px-8">
        <div className="max-w-4xl w-full mx-auto py-8 sm:py-12 flex flex-col items-center gap-6 sm:gap-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent text-center leading-tight">
            Conversational AI Assistant for your document
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-stone-700 mt-2 sm:mt-4 text-center px-4 max-w-3xl">
            Upload your document and let AI handle questions, explanations, and support for your team, clients, or anyone, 24/7.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4 sm:mt-6 w-full max-w-md sm:max-w-none">
            <Button
              className="px-4 sm:px-8 py-3 rounded-full shadow-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-sm sm:text-lg hover:scale-105 transition-transform w-full sm:w-auto min-w-0 overflow-hidden"
              onClick={() => router.push('/login')}
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="truncate block sm:hidden">Upload & Start</span>
              <span className="truncate hidden sm:block">Upload Document & Get Started</span>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full border-orange-600 text-orange-700 hover:bg-orange-100/50 font-semibold text-base sm:text-lg shadow-md w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8 text-stone-600 px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm">Free to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm">Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-12 sm:py-16 flex flex-col items-center px-4 sm:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent px-4">
          See Documet in Action
        </h2>
        <div className="w-full max-w-full sm:max-w-4xl overflow-x-auto">
          <ChromeWindow>
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-8">
              <span className="text-lg sm:text-2xl md:text-3xl font-semibold text-stone-700 mb-2 text-center">Demo Coming Soon</span>
              <span className="text-sm sm:text-base text-stone-600 text-center">You&apos;ll see how to upload, chat, and share with your AI assistant!</span>
            </div>
          </ChromeWindow>
        </div>
        <p className="mt-6 text-base sm:text-lg text-stone-600 text-center max-w-2xl px-4">
          See how easy it is to upload a document, create your AI assistant, and share it so others can ask questions and get answers directly from the document.
        </p>
      </section>

      {/* Who is this for Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 mb-3 sm:mb-4 animate-bounce" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-stone-800 text-center">Support Teams</h3>
              <p className="text-sm sm:text-base text-stone-600 text-center">Provide instant, accurate answers to customers, 24/7.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 mb-3 sm:mb-4 animate-bounce" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-stone-800 text-center">Internal Teams</h3>
              <p className="text-sm sm:text-base text-stone-600 text-center">Centralize knowledge and reduce repetitive questions.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 mb-3 sm:mb-4 animate-bounce" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-stone-800 text-center">Job Seekers & Students</h3>
              <p className="text-sm sm:text-base text-stone-600 text-center">Turn your resume or notes into an interactive, always-available expert.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform">
              <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 mb-3 sm:mb-4 animate-bounce" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-stone-800 text-center">Finance</h3>
              <p className="text-sm sm:text-base text-stone-600 text-center">Instantly extract insights from financial statements and compliance reports.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center border border-orange-200 hover:scale-105 transition-transform sm:col-span-2 lg:col-span-1">
              <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-3 sm:mb-4 animate-bounce" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-stone-800 text-center">Legal</h3>
              <p className="text-sm sm:text-base text-stone-600 text-center">Quickly find clauses and case law in lengthy contracts and filings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-orange-200 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <p className="text-stone-600 text-xs sm:text-sm text-center max-w-md">
              Transforming documents into intelligent AI assistants for better knowledge sharing and connections.
            </p>
            <p className="text-center text-stone-500 text-xs sm:text-sm">© 2025 Documet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;