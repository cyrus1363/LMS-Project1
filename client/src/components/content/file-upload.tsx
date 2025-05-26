import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  X, 
  FileText, 
  FileVideo, 
  FileAudio, 
  FileImage,
  File,
  CloudUpload
} from "lucide-react";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

export default function FileUpload({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB default
  acceptedTypes = [
    '.mp4', '.mov', '.avi', '.wmv', // Video
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', // Documents
    '.jpg', '.jpeg', '.png', '.gif', '.svg', // Images
    '.mp3', '.wav', '.ogg', // Audio
    '.zip', '.rar', '.7z', // Archives
    '.scorm' // SCORM packages
  ],
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (file: File) => {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('video/') || ['mp4', 'mov', 'avi', 'wmv'].includes(extension || '')) {
      return <FileVideo className="h-6 w-6 text-purple-500" />;
    }
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return <FileAudio className="h-6 w-6 text-green-500" />;
    }
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    }
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'].includes(extension || '')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} is not supported`;
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      // Check if we're exceeding max files
      if (files.length + validFiles.length >= maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        break;
      }

      // Check if file already exists
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        toast({
          title: "Duplicate file",
          description: `${file.name} has already been added`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
      toast({
        title: "Files added",
        description: `${validFiles.length} file(s) added successfully`,
      });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CloudUpload className={`h-12 w-12 mx-auto mb-4 ${
          isDragOver ? 'text-primary' : 'text-gray-400'
        }`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Support for {acceptedTypes.join(', ')} files up to {formatFileSize(maxSize)}
        </p>
        <Button type="button" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* File Limits Info */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Maximum {maxFiles} files</span>
        <span>{files.length} / {maxFiles} files selected</span>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected Files:</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 mr-3">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {file.type || 'Unknown type'}
                    </Badge>
                  </div>
                  {uploadProgress[file.name] !== undefined && (
                    <Progress 
                      value={uploadProgress[file.name]} 
                      className="mt-2 h-1"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
