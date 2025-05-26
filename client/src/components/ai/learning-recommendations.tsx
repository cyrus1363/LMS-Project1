import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Lightbulb,
  ChevronRight,
  Star
} from "lucide-react";

interface LearningRecommendationsProps {
  classId?: number;
  className?: string;
}

export default function LearningRecommendations({ classId, className = "" }: LearningRecommendationsProps) {
  const { user } = useAuth();
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/ai/recommendations", { classId }],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Learning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Learning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-500">
              Start engaging with content to get personalized AI recommendations!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.6) return "secondary";
    return "outline";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Learning Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Insights */}
        {recommendations.insights && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Learning Insights</h4>
                <p className="text-sm text-purple-700">{recommendations.insights}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Content */}
        {recommendations.recommendations && recommendations.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Recommended for You
            </h4>
            <div className="space-y-3">
              {recommendations.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    selectedRecommendation === index
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRecommendation(
                    selectedRecommendation === index ? null : index
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <h5 className="font-medium">{rec.title}</h5>
                        <Badge variant={getConfidenceBadge(rec.confidence)} className="ml-auto">
                          <Star className="h-3 w-3 mr-1" />
                          {Math.round(rec.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                      
                      {selectedRecommendation === index && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Why this is recommended:</span>
                          </div>
                          <p className="text-sm text-gray-600">{rec.reason}</p>
                          <Button size="sm" className="mt-3">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Start Learning
                          </Button>
                        </div>
                      )}
                    </div>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                      selectedRecommendation === index ? 'rotate-90' : ''
                    }`} />
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Confidence</span>
                      <span className={getConfidenceColor(rec.confidence)}>
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={rec.confidence * 100} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path */}
        {recommendations.learningPath && recommendations.learningPath.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Suggested Learning Path
            </h4>
            <div className="space-y-2">
              {recommendations.learningPath.map((step: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Brain className="h-4 w-4 mr-2" />
            Get More Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}