import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Highlighter, 
  Bookmark, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Share2,
  Eye,
  EyeOff,
  Palette,
  Trash2,
  Edit3,
  Save
} from "lucide-react";

interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'bookmark';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  color: string;
  page: number;
  timestamp: string;
  author: string;
}

interface PDFAnnotationProps {
  pdfUrl: string;
  title: string;
  isAccessibilityMode?: boolean;
}

export default function PDFAnnotation({ pdfUrl, title, isAccessibilityMode = false }: PDFAnnotationProps) {
  const { toast } = useToast();
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: '1',
      type: 'highlight',
      x: 150,
      y: 200,
      width: 200,
      height: 20,
      content: 'Key compliance requirement',
      color: '#ffeb3b',
      page: 1,
      timestamp: '2024-01-20T10:30:00Z',
      author: 'John Doe'
    },
    {
      id: '2',
      type: 'note',
      x: 300,
      y: 150,
      content: 'This section needs more clarification. How does this apply to our organization?',
      color: '#2196f3',
      page: 1,
      timestamp: '2024-01-20T10:35:00Z',
      author: 'Jane Smith'
    }
  ]);

  const [selectedTool, setSelectedTool] = useState<'highlight' | 'note' | 'bookmark' | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [newAnnotationContent, setNewAnnotationContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffeb3b');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);

  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const colors = ['#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50'];

  useEffect(() => {
    // Initialize PDF viewer (would use PDF.js in real implementation)
    if (pdfViewerRef.current) {
      // Simulated PDF loading
      console.log('Loading PDF:', pdfUrl);
    }
  }, [pdfUrl]);

  const addAnnotation = (x: number, y: number, width?: number, height?: number) => {
    if (!selectedTool || !newAnnotationContent.trim()) return;

    const annotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      width,
      height,
      content: newAnnotationContent,
      color: selectedColor,
      page: currentPage,
      timestamp: new Date().toISOString(),
      author: 'Current User'
    };

    setAnnotations([...annotations, annotation]);
    setNewAnnotationContent('');
    setSelectedTool(null);
    
    toast({
      title: "Annotation Added",
      description: `${selectedTool} added to page ${currentPage}`,
    });
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    toast({
      title: "Annotation Deleted",
      description: "Annotation removed successfully",
    });
  };

  const updateAnnotation = (id: string, content: string) => {
    setAnnotations(annotations.map(a => 
      a.id === id ? { ...a, content } : a
    ));
    setEditingAnnotation(null);
    toast({
      title: "Annotation Updated",
      description: "Changes saved successfully",
    });
  };

  const handlePDFClick = (event: React.MouseEvent) => {
    if (!selectedTool) return;

    const rect = pdfViewerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool === 'highlight' && !isSelecting) {
      setIsSelecting(true);
      setSelectionStart({ x, y });
    } else if (selectedTool === 'highlight' && isSelecting && selectionStart) {
      const width = Math.abs(x - selectionStart.x);
      const height = Math.abs(y - selectionStart.y);
      addAnnotation(
        Math.min(x, selectionStart.x),
        Math.min(y, selectionStart.y),
        width,
        height
      );
      setIsSelecting(false);
      setSelectionStart(null);
    } else {
      addAnnotation(x, y);
    }
  };

  const exportAnnotations = () => {
    const dataStr = JSON.stringify(annotations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}-annotations.json`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {title}
                  {isAccessibilityMode && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Accessible Mode
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(zoom - 10)}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">{zoom}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom(zoom + 10)}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportAnnotations}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Annotation Tools */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <Button
                  size="sm"
                  variant={selectedTool === 'highlight' ? 'default' : 'outline'}
                  onClick={() => setSelectedTool(selectedTool === 'highlight' ? null : 'highlight')}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === 'note' ? 'default' : 'outline'}
                  onClick={() => setSelectedTool(selectedTool === 'note' ? null : 'note')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Note
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === 'bookmark' ? 'default' : 'outline'}
                  onClick={() => setSelectedTool(selectedTool === 'bookmark' ? null : 'bookmark')}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmark
                </Button>
                
                <div className="border-l pl-3 ml-3">
                  <div className="flex gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className="ml-auto"
                >
                  {showAnnotations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAnnotations ? 'Hide' : 'Show'} Annotations
                </Button>
              </div>

              {/* PDF Content Area */}
              <div 
                ref={pdfViewerRef}
                className="relative border rounded-lg bg-white min-h-[600px] cursor-crosshair"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                onClick={handlePDFClick}
              >
                {/* Simulated PDF Content */}
                <div className="p-8 text-gray-800 leading-relaxed">
                  <h1 className="text-2xl font-bold mb-6">HIPAA Compliance Guidelines</h1>
                  <p className="mb-4">
                    The Health Insurance Portability and Accountability Act (HIPAA) establishes 
                    national standards for the protection of health information. Organizations 
                    must implement appropriate safeguards to protect patient data.
                  </p>
                  <h2 className="text-xl font-semibold mb-4">Key Requirements</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Administrative safeguards for workforce access</li>
                    <li>Physical safeguards for data storage and transmission</li>
                    <li>Technical safeguards including encryption and access controls</li>
                  </ul>
                  <p className="mt-4">
                    Compliance requires ongoing monitoring, staff training, and regular 
                    risk assessments to ensure patient privacy is maintained.
                  </p>
                </div>

                {/* Annotations Overlay */}
                {showAnnotations && annotations
                  .filter(a => a.page === currentPage)
                  .map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute border-2 cursor-pointer group"
                      style={{
                        left: annotation.x,
                        top: annotation.y,
                        width: annotation.width || 'auto',
                        height: annotation.height || 'auto',
                        backgroundColor: annotation.type === 'highlight' ? annotation.color : 'transparent',
                        borderColor: annotation.color,
                        opacity: annotation.type === 'highlight' ? 0.3 : 1,
                      }}
                    >
                      {annotation.type !== 'highlight' && (
                        <div 
                          className="bg-white shadow-lg rounded p-2 min-w-48 border"
                          style={{ borderColor: annotation.color }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {annotation.type}
                            </Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAnnotation(annotation.id);
                                }}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAnnotation(annotation.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {editingAnnotation === annotation.id ? (
                            <div className="space-y-2">
                              <Textarea
                                defaultValue={annotation.content}
                                className="text-xs"
                                rows={3}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.ctrlKey) {
                                    updateAnnotation(annotation.id, e.currentTarget.value);
                                  }
                                }}
                              />
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                    updateAnnotation(annotation.id, textarea.value);
                                  }}
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 text-xs"
                                  onClick={() => setEditingAnnotation(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-gray-700">{annotation.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">{annotation.author}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(annotation.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>

              {/* Page Navigation */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button size="sm" variant="outline" disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage} of 5</span>
                <Button size="sm" variant="outline" disabled={currentPage === 5}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Annotation Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Annotations ({annotations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Annotation */}
              {selectedTool && (
                <div className="space-y-3 p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2">
                    {selectedTool === 'highlight' && <Highlighter className="h-4 w-4" />}
                    {selectedTool === 'note' && <MessageSquare className="h-4 w-4" />}
                    {selectedTool === 'bookmark' && <Bookmark className="h-4 w-4" />}
                    <span className="text-sm font-medium">Add {selectedTool}</span>
                  </div>
                  <Textarea
                    placeholder={`Enter ${selectedTool} content...`}
                    value={newAnnotationContent}
                    onChange={(e) => setNewAnnotationContent(e.target.value)}
                    rows={3}
                  />
                  {selectedTool === 'highlight' ? (
                    <p className="text-xs text-gray-600">
                      Click and drag on the PDF to create a highlight
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Click on the PDF where you want to add this {selectedTool}
                    </p>
                  )}
                </div>
              )}

              {/* Existing Annotations */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {annotations.map((annotation) => (
                  <div key={annotation.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: annotation.color, color: annotation.color }}
                      >
                        {annotation.type}
                      </Badge>
                      <span className="text-xs text-gray-500">Page {annotation.page}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{annotation.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{annotation.author}</span>
                      <span>{new Date(annotation.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accessibility Features */}
              {isAccessibilityMode && (
                <div className="mt-4 p-3 border rounded-lg bg-green-50">
                  <h4 className="text-sm font-medium mb-2">Accessibility Options</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      🔊 Read Aloud
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      🔍 High Contrast
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      📖 Simplified View
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}