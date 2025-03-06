import React, { useState, useRef, useEffect } from "react";
import "./Editor.css";

const Editor = () => {
  const [text, setText] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState({ row: 1, column: 1 });
  const [lineCount, setLineCount] = useState(1);
  const [visibleLines, setVisibleLines] = useState(1);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    updateCursorPosition(event.target);

    // Update line count
    const lines = newText.split("\n").length;
    setLineCount(Math.max(lines, 1));
  };

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const position = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, position);
    const linesBeforeCursor = textBeforeCursor.split("\n");

    const row = linesBeforeCursor.length;
    const column = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;

    setCursorPosition({ row, column });
  };

  const handleClick = () => {
    if (textareaRef.current) {
      updateCursorPosition(textareaRef.current);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    updateCursorPosition(event.currentTarget);

    // Toggle status bar with Ctrl+B
    if (event.ctrlKey && event.key === "b") {
      event.preventDefault();
      setShowStatusBar((prev) => !prev);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent default browser behavior for Ctrl+B
    if (event.ctrlKey && event.key === "b") {
      event.preventDefault();
    }
  };

  // Handle resize to adjust editor dimensions to fill the viewport
  useEffect(() => {
    const handleResize = () => {
      if (editorContainerRef.current) {
        // Let CSS handle the full viewport sizing
        // Just ensure we're recalculating if the status bar visibility changes
        calculateVisibleLines();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showStatusBar]);

  // Synchronize scroll between textarea and line numbers
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (!textarea || !lineNumbers) return;

    const handleScroll = () => {
      if (lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
      }
    };

    textarea.addEventListener("scroll", handleScroll);
    return () => {
      textarea.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Generate line numbers - show the greater of actual lines or visible lines
  const renderLineNumbers = () => {
    const lineNumbers = [];
    const totalLines = Math.max(lineCount, visibleLines);

    for (let i = 1; i <= totalLines; i++) {
      lineNumbers.push(
        <div key={i} className="line-number">
          {i}
        </div>,
      );
    }
    return lineNumbers;
  };

  // Calculate visible lines based on textarea height
  const calculateVisibleLines = () => {
    if (textareaRef.current && editorContainerRef.current) {
      const textareaHeight = textareaRef.current.clientHeight;
      const lineHeight =
        parseInt(getComputedStyle(textareaRef.current).lineHeight) || 21; // Default to 21px if can't get line height
      const visibleLineCount = Math.floor(textareaHeight / lineHeight);
      setVisibleLines(Math.max(visibleLineCount, 1));
    }
  };

  // Initialize with at least one line and calculate visible lines
  useEffect(() => {
    setLineCount(Math.max(text.split("\n").length, 1));
    calculateVisibleLines();
  }, []);

  // Recalculate visible lines whenever the editor container is resized
  useEffect(() => {
    calculateVisibleLines();
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleLines();
    });

    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="editor-wrapper">
      <div
        className={`editor ${showStatusBar ? "with-status-bar" : "full-height"}`}
      >
        <div className="editor-container" ref={editorContainerRef}>
          <div className="line-numbers" ref={lineNumbersRef}>
            {renderLineNumbers()}
          </div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={text}
            onChange={handleTextChange}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            onKeyDown={handleKeyDown}
            placeholder="Start writing here..."
            spellCheck={false}
          />
        </div>
        {showStatusBar && (
          <div className="status-bar">
            <div className="cursor-position">
              Position: Row {cursorPosition.row}, Column {cursorPosition.column}
            </div>
            <div className="status-bar-info">
              <span>Press Ctrl+B to toggle status bar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
