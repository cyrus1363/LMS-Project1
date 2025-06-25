import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Move,
  Save,
  Settings,
  CheckCircle2,
  Circle,
  Square,
  Type,
  FileText
} from "lucide-react";
import { type ContentItem } from "@shared/schema";
import { type QuizContent, type QuizQuestion } from "@shared/content-types";

interface QuizBuilderProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice", icon: CheckCircle2 },
  { value: "true_false", label: "True/False", icon: Circle },
  { value: "fill_blank", label: "Fill in the Blank", icon: Type },
  { value: "essay", label: "Essay Question", icon: FileText },
];

export default function QuizBuilder({ moduleId, editingContent, onSave, onCancel }: QuizBuilderProps) {
  const [title, setTitle] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [settings, setSettings] = useState({
    timeLimit: 30, // minutes
    maxAttempts: 3,
    randomizeQuestions: false,
    randomizeAnswers: false,
    showCorrectAnswers: true,
    passingScore: 70,
    allowReview: true,
  });

  useEffect(() => {
    if (editingContent && editingContent.quizData) {
      const quizData = editingContent.quizData as QuizContent;
      setTitle(editingContent.title);
      setIsRequired(editingContent.isRequired);
      setInstructions(quizData.instructions || "");
      setQuestions(quizData.questions || []);
      setSettings(quizData.settings || settings);
    }
  }, [editingContent]);

  const addQuestion = (type: string) => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      type: type as any,
      question: "",
      points: 1,
      options: type === "multiple_choice" || type === "true_false" ? [
        { id: "opt_1", text: "", isCorrect: false },
        { id: "opt_2", text: "", isCorrect: false },
      ] : undefined,
    };

    if (type === "true_false") {
      newQuestion.options = [
        { id: "true", text: "True", isCorrect: false },
        { id: "false", text: "False", isCorrect: false },
      ];
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const newOption = {
      id: `opt_${Date.now()}`,
      text: "",
      isCorrect: false,
    };

    updateQuestion(questionId, {
      options: [...question.options, newOption],
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, text } : opt
    );

    updateQuestion(questionId, { options: updatedOptions });
  };

  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const updatedOptions = question.options.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId ? !opt.isCorrect : 
                 question.type === "multiple_choice" ? opt.isCorrect : false
    }));

    updateQuestion(questionId, { options: updatedOptions });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question.trim()) {
        alert("All questions must have text");
        return;
      }

      if (question.type === "multiple_choice" || question.type === "true_false") {
        if (!question.options?.some(opt => opt.isCorrect)) {
          alert(`Question "${question.question}" must have at least one correct answer`);
          return;
        }
      }
    }

    const quizData: QuizContent = {
      type: "quiz",
      questions,
      settings,
      instructions,
    };

    const contentData = {
      title,
      contentType: "quiz",
      moduleId,
      authorId: "current-user", // Should come from auth context
      isRequired,
      quizData,
      mediaMetadata: {
        questionCount: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        estimatedTime: settings.timeLimit,
      },
    };

    try {
      const url = editingContent 
        ? `/api/content/${editingContent.id}` 
        : "/api/content";
      
      const method = editingContent ? "PUT" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      
      onSave();
    } catch (error) {
      console.error("Failed to save quiz:", error);
      alert("Failed to save quiz. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto">
      {/* Quiz Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Quiz Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title..."
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="required"
            checked={isRequired}
            onCheckedChange={setIsRequired}
          />
          <Label htmlFor="required">Required for completion</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Provide instructions for students taking this quiz..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Quiz Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              value={settings.timeLimit}
              onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || 30})}
              min="1"
              max="180"
            />
          </div>
          <div>
            <Label>Max Attempts</Label>
            <Input
              type="number"
              value={settings.maxAttempts}
              onChange={(e) => setSettings({...settings, maxAttempts: parseInt(e.target.value) || 1})}
              min="1"
              max="10"
            />
          </div>
          <div>
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              value={settings.passingScore}
              onChange={(e) => setSettings({...settings, passingScore: parseInt(e.target.value) || 70})}
              min="0"
              max="100"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.randomizeQuestions}
                onCheckedChange={(checked) => setSettings({...settings, randomizeQuestions: checked})}
              />
              <Label>Randomize Questions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.showCorrectAnswers}
                onCheckedChange={(checked) => setSettings({...settings, showCorrectAnswers: checked})}
              />
              <Label>Show Correct Answers</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Questions ({questions.length})</span>
            <div className="flex gap-2">
              {questionTypes.map(type => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(type.value)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No questions yet</h3>
              <p className="mb-4">Start building your quiz by adding your first question.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Badge>{questionTypes.find(t => t.value === question.type)?.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Points:</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                          className="w-16 h-8"
                          min="1"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Question Text *</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        placeholder="Enter your question..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {(question.type === "multiple_choice" || question.type === "true_false") && question.options && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label>Answer Options</Label>
                          {question.type === "multiple_choice" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              className="gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Option
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-3">
                              <Button
                                variant={option.isCorrect ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleCorrectAnswer(question.id, option.id)}
                                className="w-8 h-8 p-0"
                              >
                                {option.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </Button>
                              <Input
                                value={option.text}
                                onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1"
                                disabled={question.type === "true_false"}
                              />
                              {question.type === "multiple_choice" && question.options!.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updatedOptions = question.options!.filter(opt => opt.id !== option.id);
                                    updateQuestion(question.id, { options: updatedOptions });
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Essay Question Settings */}
                    {question.type === "essay" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Word Limit (optional)</Label>
                          <Input
                            type="number"
                            value={question.wordLimit || ""}
                            onChange={(e) => updateQuestion(question.id, { 
                              wordLimit: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            placeholder="No limit"
                          />
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                        placeholder="Explain the correct answer..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save/Cancel Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {editingContent ? "Update Quiz" : "Save Quiz"}
        </Button>
      </div>
    </div>
  );
}