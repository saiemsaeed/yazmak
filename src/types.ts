// Define your component props interfaces
export interface EditorProps {
  initialContent?: string[];
  onChange?: (content: string[]) => void;
  // Add other props your editor component accepts
}

// Export any other types that users of your library might need
