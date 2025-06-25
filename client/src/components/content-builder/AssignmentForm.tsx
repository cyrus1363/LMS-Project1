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
  Save,
  Calendar,
  Clock,
  FileText,
  CheckCircle2
} from "lucide-react";
import { type ContentItem } from "@shared/schema";

interface AssignmentFormProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
}

export default function AssignmentForm({ moduleId, editingContent, onSave, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [settings, setSettings] = useState({
    maxAttempts: 1,
    timeLimit: 0, // 0 = no limit
    allowLateSubmissions: true,
    latePenalty: 10, // percentage
    dueDate: "",
    submissionTypes: ["file_upload", "text_entry"],
    maxFileSize: 10, // MB
    allowedFileTypes: ["pdf", "doc", "docx", "txt"],
  });
  const [rubric, setRubric] = useState<RubricCriterion[]>([
    {
      id: "criterion_1",
      name: "Content Quality",
      description: "Accuracy, depth, and relevance of content",
      maxPoints: 25,
    },
    {
      id: "criterion_2", 
      name: "Organization",
      description: "Clear structure and logical flow",
      maxPoints: 25,
    },
  ]);

  useEffect(() => {
    if (editingContent && editingContent.assignmentData) {
      const assignmentData = editingContent.assignmentData as any;
      setTitle(editingContent.title);
      setInstructions(assignmentData.instructions || "");
      setIsRequired(editingContent.isRequired);
      setSettings(assignmentData.settings || settings);
      setRubric(assignmentData.rubric || rubric);
    }
  }, [editingContent]);

  const addRubricCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: `criterion_${Date.now()}`,
      name: "",
      description: "",
      maxPoints: 25,
    };
    setRubric([...rubric, newCriterion]);
  };

  const updateRubricCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setRubric(rubric.map(criterion => 
      criterion.id === id ? { ...criterion, ...updates } : criterion
    ));
  };

  const deleteRubricCriterion = (id: string) => {
    setRubric(rubric.filter(criterion => criterion.id !== id));
  };

  const getTotalPoints = () => {
    return rubric.reduce((total, criterion) => total + criterion.maxPoints, 0);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter an assignment title");
      return;
    }

    if (!instructions.trim()) {
      alert("Please provide assignment instructions");
      return;
    }

    // Validate rubric
    for (const criterion of rubric) {
      if (!criterion.name.trim()) {
        alert("All rubric criteria must have names");
        return;
      }
    }

    const assignmentData = {
      type: "assignment",
      instructions,
      settings,
      rubric,
      totalPoints: getTotalPoints(),
    };

    const contentData = {
      title,
      contentType: "assignment",
      moduleId,
      authorId: "current-user", // Should come from auth context
      isRequired,
      assignmentData,
      mediaMetadata: {
        totalPoints: getTotalPoints(),
        criteriaCount: rubric.length,
        dueDate: settings.dueDate,
        timeLimit: settings.timeLimit,
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
      console.error("Failed to save assignment:", error);
      alert("Failed to save assignment. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto">
      {/* Assignment Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Assignment Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assignment title..."
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
        <Label htmlFor="instructions">Assignment Instructions *</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Provide detailed instructions for the assignment..."
          className="mt-1"
          rows={6}
        />
      </div>

      {/* Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Assignment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Due Date</Label>
              <Input
                type="datetime-local"
                value={settings.dueDate}
                onChange={(e) => setSettings({...settings, dueDate: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time Limit (minutes, 0 = unlimited)</Label>
              <Input
                type="number"
                value={settings.timeLimit}
                onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || 0})}
                min="0"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Attempts</Label>
              <Input
                type="number"
                value={settings.maxAttempts}
                onChange={(e) => setSettings({...settings, maxAttempts: parseInt(e.target.value) || 1})}
                min="1"
                max="10"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max File Size (MB)</Label>
              <Input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value) || 10})}
                min="1"
                max="100"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.allowLateSubmissions}
                onCheckedChange={(checked) => setSettings({...settings, allowLateSubmissions: checked})}
              />
              <Label>Allow late submissions</Label>
            </div>
            
            {settings.allowLateSubmissions && (
              <div>
                <Label>Late penalty (%)</Label>
                <Input
                  type="number"
                  value={settings.latePenalty}
                  onChange={(e) => setSettings({...settings, latePenalty: parseInt(e.target.value) || 0})}
                  min="0"
                  max="100"
                  className="mt-1 w-32"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Submission Types</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={settings.submissionTypes.includes("file_upload") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const types = settings.submissionTypes.includes("file_upload")
                    ? settings.submissionTypes.filter(t => t !== "file_upload")
                    : [...settings.submissionTypes, "file_upload"];
                  setSettings({...settings, submissionTypes: types});
                }}
              >
                File Upload
              </Button>
              <Button
                variant={settings.submissionTypes.includes("text_entry") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const types = settings.submissionTypes.includes("text_entry")
                    ? settings.submissionTypes.filter(t => t !== "text_entry")
                    : [...settings.submissionTypes, "text_entry"];
                  setSettings({...settings, submissionTypes: types});
                }}
              >
                Text Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grading Rubric */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Grading Rubric
              <Badge variant="outline">{getTotalPoints()} points total</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={addRubricCriterion} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Criterion
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rubric.map((criterion, index) => (
            <Card key={criterion.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Points:</Label>
                    <Input
                      type="number"
                      value={criterion.maxPoints}
                      onChange={(e) => updateRubricCriterion(criterion.id, { 
                        maxPoints: parseInt(e.target.value) || 0 
                      })}
                      className="w-20 h-8"
                      min="1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRubricCriterion(criterion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Criterion Name *</Label>
                    <Input
                      value={criterion.name}
                      onChange={(e) => updateRubricCriterion(criterion.id, { name: e.target.value })}
                      placeholder="e.g., Content Quality, Organization, Grammar"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={criterion.description}
                      onChange={(e) => updateRubricCriterion(criterion.id, { description: e.target.value })}
                      placeholder="Describe what students need to achieve for full points..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {rubric.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No grading criteria</h3>
              <p className="mb-4">Add criteria to create a grading rubric for this assignment.</p>
              <Button onClick={addRubricCriterion} className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Criterion
              </Button>
            </div>
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
          {editingContent ? "Update Assignment" : "Save Assignment"}
        </Button>
      </div>
    </div>
  );
}