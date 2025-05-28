import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BookOpen, Users, BarChart3, Lock, CheckCircle } from "lucide-react";

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">EduEase</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Learning Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive HIPAA-compliant LMS with advanced security, multi-tier access management, 
            and AI-powered learning experiences for healthcare and enterprise organizations.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/api/login'}>
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose EduEase?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>HIPAA Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with AES-256 encryption, PHI detection, and comprehensive audit logging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Multi-Tier Access</CardTitle>
                <CardDescription>
                  Sophisticated role-based permissions with master admin, organization admin, trainer, and student levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Comprehensive reporting, learning analytics, and CPE compliance tracking for professional education
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Healthcare-Ready Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for healthcare and enterprise environments with comprehensive compliance controls
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>AES-256 encryption for data at rest and in transit</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Advanced PHI detection with 9 pattern types</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>6+ year audit logging with encrypted retention</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Secure file deletion with DoD standards</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Real-time compliance monitoring</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Automated risk assessments</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Business Associate Agreement management</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Incident response and breach notification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Learning Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join organizations already using EduEase for secure, compliant, and effective learning experiences.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="ml-2 text-xl font-bold">EduEase</span>
          </div>
          <p className="text-gray-400">
            Enterprise Learning Management • HIPAA Compliant • Healthcare Ready
          </p>
        </div>
      </footer>
    </div>
  );
}