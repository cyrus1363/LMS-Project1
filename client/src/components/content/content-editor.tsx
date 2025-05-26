import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Undo,
  Redo
} from "lucide-react";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ContentEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your content here...",
  className = ""
}: ContentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      executeCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      command: 'bold',
      tooltip: 'Bold (Ctrl+B)'
    },
    {
      icon: Italic,
      command: 'italic',
      tooltip: 'Italic (Ctrl+I)'
    },
    {
      icon: Underline,
      command: 'underline',
      tooltip: 'Underline (Ctrl+U)'
    },
    {
      separator: true
    },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      tooltip: 'Align Left'
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      tooltip: 'Align Center'
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      tooltip: 'Align Right'
    },
    {
      separator: true
    },
    {
      icon: List,
      command: 'insertUnorderedList',
      tooltip: 'Bullet List'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      tooltip: 'Numbered List'
    },
    {
      separator: true
    },
    {
      icon: Quote,
      command: 'formatBlock',
      value: 'blockquote',
      tooltip: 'Quote'
    },
    {
      icon: Code,
      command: 'formatBlock',
      value: 'pre',
      tooltip: 'Code Block'
    },
    {
      separator: true
    },
    {
      icon: Link,
      command: 'createLink',
      tooltip: 'Insert Link',
      onClick: () => {
        const url = prompt('Enter URL:');
        if (url) {
          executeCommand('createLink', url);
        }
      }
    },
    {
      separator: true
    },
    {
      icon: Undo,
      command: 'undo',
      tooltip: 'Undo (Ctrl+Z)'
    },
    {
      icon: Redo,
      command: 'redo',
      tooltip: 'Redo (Ctrl+Y)'
    }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        {toolbarButtons.map((button, index) => {
          if (button.separator) {
            return <Separator key={index} orientation="vertical" className="h-6 mx-1" />;
          }

          const Icon = button.icon!;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={button.tooltip}
              onClick={button.onClick || (() => executeCommand(button.command!, button.value))}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`min-h-[200px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''
        }`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 0.75rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
