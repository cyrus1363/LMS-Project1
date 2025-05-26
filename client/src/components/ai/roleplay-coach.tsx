import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot,
  Star,
  BarChart3,
  Target,
  Lightbulb,
  RefreshCw,
  Play,
  Square
} from "lucide-react";

interface RoleplayMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RoleplayCoachProps {
  className?: string;
}

export default function RoleplayCoach({ className = "" }: RoleplayCoachProps) {
  const [selectedCharacter, setSelectedCharacter] = useState("alex");
  const [isActive, setIsActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<RoleplayMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const characters = {
    alex: {
      name: "Alex",
      title: "Project Lead",
      description: "Direct, results-driven manager who needs coaching on team impact",
      avatar: "👨‍💼",
      difficulty: "Medium",
      scenario: "Practice giving feedback to a dominant project lead about their communication style."
    },
    mentor: {
      name: "Sarah",
      title: "Senior Mentor",
      description: "Experienced coach who helps you practice mentoring skills",
      avatar: "👩‍🏫",
      difficulty: "Easy",
      scenario: "Practice your mentoring and coaching conversation skills."
    },
    difficult_employee: {
      name: "Jordan",
      title: "Team Member",
      description: "Challenging employee who resists change and feedback",
      avatar: "😤",
      difficulty: "Hard",
      scenario: "Practice managing a difficult conversation with a resistant team member."
    }
  };

  const roleplayMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/roleplay", {
        message,
        characterId: selectedCharacter,
        conversationHistory
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: RoleplayMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, aiMessage]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get response from roleplay character",
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      const transcript = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'You' : characters[selectedCharacter as keyof typeof characters].name}: ${msg.content}`)
        .join('\n\n');
        
      const response = await apiRequest("POST", "/api/ai/roleplay/feedback", {
        transcript
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data);
      setShowFeedback(true);
      toast({
        title: "Feedback Generated",
        description: "Your roleplay performance has been analyzed!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate feedback",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || roleplayMutation.isPending) return;

    const userMessage: RoleplayMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setConversationHistory(prev => [...prev, userMessage]);
    roleplayMutation.mutate(currentMessage);
    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRoleplay = () => {
    setIsActive(true);
    setConversationHistory([]);
    setShowFeedback(false);
    setFeedback(null);
    
    // Send initial character message
    const character = characters[selectedCharacter as keyof typeof characters];
    const initialMessage: RoleplayMessage = {
      role: 'assistant',
      content: `Hi, I'm ${character.name}. I'm ready to start our roleplay scenario: ${character.scenario} How would you like to begin?`,
      timestamp: new Date()
    };
    setConversationHistory([initialMessage]);
  };

  const endRoleplay = () => {
    setIsActive(false);
    if (conversationHistory.length > 1) {
      feedbackMutation.mutate();
    }
  };

  const resetRoleplay = () => {
    setIsActive(false);
    setConversationHistory([]);
    setShowFeedback(false);
    setFeedback(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          AI Roleplay Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isActive ? (
          <div className="space-y-6">
            {/* Character Selection */}
            <div>
              <h4 className="font-medium mb-3">Choose Your Roleplay Character</h4>
              <div className="grid gap-3">
                {Object.entries(characters).map(([id, character]) => (
                  <div
                    key={id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCharacter === id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCharacter(id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{character.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{character.name}</h5>
                          <Badge variant="outline">{character.title}</Badge>
                          <Badge variant={
                            character.difficulty === "Easy" ? "default" :
                            character.difficulty === "Medium" ? "secondary" : "destructive"
                          }>
                            {character.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                        <p className="text-xs text-gray-500">{character.scenario}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button onClick={startRoleplay} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Roleplay with {characters[selectedCharacter as keyof typeof characters].name}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Roleplay Header */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-xl">{characters[selectedCharacter as keyof typeof characters].avatar}</div>
                <div>
                  <h4 className="font-medium">{characters[selectedCharacter as keyof typeof characters].name}</h4>
                  <p className="text-sm text-gray-600">{characters[selectedCharacter as keyof typeof characters].title}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={endRoleplay} variant="outline" size="sm">
                  <Square className="w-4 h-4 mr-2" />
                  End & Get Feedback
                </Button>
                <Button onClick={resetRoleplay} variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Conversation Area */}
            <ScrollArea className="h-96 p-4 border rounded-lg" ref={scrollAreaRef}>
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {roleplayMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                disabled={roleplayMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || roleplayMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Roleplay Performance Feedback
              </DialogTitle>
              <DialogDescription>
                AI-powered analysis of your roleplay conversation
              </DialogDescription>
            </DialogHeader>

            {feedback && (
              <Tabs defaultValue="scores" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scores">Scores</TabsTrigger>
                  <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="scores" className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      <span className={getScoreColor(feedback.overallScore)}>
                        {feedback.overallScore}/10
                      </span>
                    </div>
                    <p className="text-gray-600">Overall Performance</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(feedback.scores).map(([skill, score]: [string, any]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{skill}</span>
                          <Badge variant={getScoreBadge(score)}>
                            {score}/10
                          </Badge>
                        </div>
                        <Progress value={score * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Overall Feedback
                    </h4>
                    <p className="text-sm text-gray-600">{feedback.feedback}</p>
                  </div>

                  {feedback.specificSuggestions && feedback.specificSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Specific Suggestions
                      </h4>
                      <div className="space-y-2">
                        {feedback.specificSuggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowFeedback(false)}>
                Close
              </Button>
              <Button onClick={() => { setShowFeedback(false); resetRoleplay(); }}>
                Start New Roleplay
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}