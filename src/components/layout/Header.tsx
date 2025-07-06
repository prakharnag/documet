'use client';

import { Button } from "@/components/ui/button";
import { Bot, Menu, X, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
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
              <GraduationCap className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <button 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2 bg-transparent border-none outline-none cursor-pointer text-left"
                onClick={() => { setIsMenuOpen(false); scrollToSection('cta'); }}
              >
                How It Works
              </button>
              <button 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2 bg-transparent border-none outline-none cursor-pointer text-left"
                onClick={() => { setIsMenuOpen(false); scrollToSection('benefits'); }}
              >
                Benefits
              </button>
              <a 
                href="#demo" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </a>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <Button variant="default" size="sm" className="justify-start" onClick={() => { setIsMenuOpen(false); router.push('/handler/sign-in'); }}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;