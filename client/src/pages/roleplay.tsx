import RoleplayCoach from "@/components/ai/roleplay-coach";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Target, Users, Brain } from "lucide-react";

export default function RoleplayPage() {
  const { user } = useAuth();

  const benefits = [
    {
      icon: MessageCircle,
      title: "Practice Real Conversations",
      description: "Engage with AI characters that simulate real workplace scenarios"
    },
    {
      icon: Target,
      title: "Targeted Skill Building",
      description: "Focus on specific communication and leadership challenges"
    },
    {
      icon: Users,
      title: "Safe Learning Environment",
      description: "Make mistakes and learn without real-world consequences"
    },
    {
      icon: Brain,
      title: "AI-Powered Feedback",
      description: "Get detailed analysis and personalized improvement suggestions"
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">AI Roleplay Coach</h1>
          <Badge variant="secondary">Interactive Training</Badge>
        </div>
        <p className="text-gray-600">
          Practice leadership conversations with AI characters and receive instant feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Roleplay Interface */}
        <div className="lg:col-span-2">
          <RoleplayCoach />
        </div>

        {/* Information Sidebar */}
        <div className="space-y-6">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why Use Roleplay Training?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roleplay Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Be Authentic</p>
                <p className="text-xs text-blue-700">Respond naturally as you would in real situations</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1">Take Your Time</p>
                <p className="text-xs text-green-700">Think through your responses before sending</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">Learn from Feedback</p>
                <p className="text-xs text-purple-700">Review the AI analysis to improve your skills</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Roleplays Completed</p>
              </div>
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">Start your first roleplay to track your progress!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}