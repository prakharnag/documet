'use client';
import { Clock, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const studentBenefits = [
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Your AI assistant works around the clock, answering recruiter questions even when you're sleeping."
  },
  {
    icon: MessageSquare,
    title: "Instant Responses",
    description: "Recruiters get immediate, accurate answers about your skills and experience."
  },
  {
    icon: Star,
    title: "Consistent Messaging",
    description: "Never worry about inconsistent self-presentation. Your AI maintains your professional brand."
  }
];

const BenefitsSection = () => {
  const router = useRouter();
  return (
    <section id="benefits" className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Ressumate?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Revolutionizing how job seekers connect with opportunities through intelligent resume conversations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* For Job Seekers */}
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Clock className="w-4 h-4" />
                For Job Seekers
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Stand Out From the Crowd
              </h3>
              <p className="text-gray-600">
                Give recruiters a modern, interactive way to learn about you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {studentBenefits.map((benefit, index) => (
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
                Create My AI Resume Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;