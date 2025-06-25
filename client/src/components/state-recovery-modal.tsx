import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RotateCcw, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StateRecoveryModalProps {
  isOpen: boolean;
  stateData: any;
  onRecover: () => void;
  onDismiss: () => void;
}

export default function StateRecoveryModal({ 
  isOpen, 
  stateData, 
  onRecover, 
  onDismiss 
}: StateRecoveryModalProps) {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      await onRecover();
    } finally {
      setIsRecovering(false);
    }
  };

  if (!stateData) return null;

  const timeAgo = formatDistanceToNow(new Date(stateData.timestamp), { addSuffix: true });

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Recovery Available</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                We found unsaved work from your previous session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last saved {timeAgo}</span>
                </div>

                {stateData.route && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Page: </span>
                    <Badge variant="outline">{stateData.route}</Badge>
                  </div>
                )}

                {stateData.courseCreationState?.isOpen && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Course Creation in Progress</span>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      {stateData.courseCreationState.formData?.title && (
                        <div>Course: {stateData.courseCreationState.formData.title}</div>
                      )}
                      {stateData.courseCreationState.selectedTeachers?.length > 0 && (
                        <div>{stateData.courseCreationState.selectedTeachers.length} teacher(s) selected</div>
                      )}
                    </div>
                  </div>
                )}

                {Object.keys(stateData.formData || {}).length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Form Data Available</span>
                    </div>
                    <div className="text-xs text-green-700">
                      {Object.keys(stateData.formData).length} field(s) with unsaved data
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleRecover}
              disabled={isRecovering}
              className="flex-1"
            >
              {isRecovering ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Recover Session
            </Button>
            
            <Button
              variant="outline"
              onClick={onDismiss}
              disabled={isRecovering}
            >
              <X className="w-4 h-4 mr-2" />
              Start Fresh
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your data is stored locally and will be automatically cleared after 24 hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}