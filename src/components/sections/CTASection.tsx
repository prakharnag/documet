'use client';
import { Button } from "@/components/ui/button";
import { Upload, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const CTASection = () => {
  const router = useRouter();
  return (
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
                  <span className="text-gray-800">Documet Creates AI Assistant</span>
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
              Upload Document & Get Started
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
  );
};

export default CTASection;