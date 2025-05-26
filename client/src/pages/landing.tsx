import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Interactive Learning",
      description: "Engage with rich multimedia content and interactive assessments designed for modern learners."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Comprehensive Content",
      description: "Access a vast library of courses, lessons, and resources created by expert instructors."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaborative Environment",
      description: "Connect with peers and instructors in a supportive learning community."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and performance insights."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-gray-900">EduPlatform</span>
            </div>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Learning
            <span className="text-primary block">Experience</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of learners on our comprehensive learning management platform. 
            Access expert-led courses, track your progress, and achieve your educational goals.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <a href="/api/login">Get Started</a>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EduPlatform?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with proven educational methodologies 
              to deliver an unparalleled learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center h-full">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of learners and unlock your potential with personalized learning experiences.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="/api/login">Sign Up Now</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold">EduPlatform</span>
            </div>
            <p className="text-gray-400">
              © 2024 EduPlatform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
