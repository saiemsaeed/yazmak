import React, { useEffect, useRef, useState } from "react";
import { KEY_BINDINGS } from "./constants/key-bindings";
import "./CustomEditor.css";

type Config = {};

type CustomEditorProps = {
  initialText: string;
  config?: {};
};

const EDITOR_MODES = {
  NORMAL: "NORMAL",
  INSERT: "INSERT",
};

function CustomEditor({ initialText, config }: CustomEditorProps) {
  const [lines, setLines] = useState(initialText.split("\n"));
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const editorRef = useRef(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!isTextSelected && lineRefs.current[activeRowIndex]) {
      const lineElement = lineRefs.current[activeRowIndex];

      if (!lineElement) return;

      // Focus the line
      lineElement.focus();

      // Set cursor position
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();

      if (lineElement.textContent && lineElement.firstChild) {
        // If there's text content
        const position = Math.min(
          activeColumnIndex,
          lineElement.textContent.length || 0,
        );
        range.setStart(lineElement.firstChild, position);
        range.setEnd(lineElement.firstChild, position);
      }

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [activeRowIndex, activeColumnIndex, lines, isTextSelected]);

  const handleLineInput = (
    e: React.FormEvent<HTMLDivElement>,
    lineIndex: number,
  ) => {
    const newContent = (e.target as HTMLDivElement).textContent || "";
    const newLines = [...lines];
    newLines[lineIndex] = newContent;

    setLines(newLines);

    setActiveColumnIndex(activeColumnIndex + 1);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    lineIndex: number,
  ) => {
    // Handle Up arrow
    if (e.key === KEY_BINDINGS.MOVE_UP && lineIndex > 0) {
      e.preventDefault();

      const newLineLength = lines[lineIndex - 1].length;
      const newCursorColumnPosition = Math.min(
        activeColumnIndex,
        newLineLength,
      );

      setActiveRowIndex(lineIndex - 1);
      setActiveColumnIndex(newCursorColumnPosition);
      return;
    }

    // Handle Down arrow
    if (e.key === KEY_BINDINGS.MOVE_DOWN && lineIndex < lines.length - 1) {
      e.preventDefault();

      const newLineLength = lines[lineIndex + 1].length;
      const newColumnPosition = Math.min(activeColumnIndex, newLineLength);

      setActiveRowIndex(lineIndex + 1);
      setActiveColumnIndex(newColumnPosition);
      return;
    }

    if (e.key === KEY_BINDINGS.MOVE_LEFT) {
      e.preventDefault();

      let newRowIndex = activeRowIndex;
      let newColumnIndex = activeColumnIndex;

      if (newColumnIndex === 0 && newRowIndex === 0) {
        return;
      }

      // handle if the cursor is at the beginning of the line and its not first line
      if (activeColumnIndex === 0 && activeRowIndex > 0) {
        newRowIndex = activeRowIndex - 1;
        newColumnIndex = lines[newRowIndex].length;
      } else {
        newColumnIndex = activeColumnIndex - 1;
      }

      setActiveRowIndex(newRowIndex);
      setActiveColumnIndex(newColumnIndex);
      return;
    }

    if (e.key === KEY_BINDINGS.MOVE_RIGHT) {
      e.preventDefault();

      let newRowIndex = activeRowIndex;
      let newColumnIndex = activeColumnIndex;
      // handle if the cursor is at the end of the line
      if (
        activeColumnIndex === lines[activeRowIndex].length &&
        lineIndex < lines.length - 1
      ) {
        newRowIndex = activeRowIndex + 1;
        newColumnIndex = 0;
      } else if (activeColumnIndex < lines[activeRowIndex].length) {
        newColumnIndex = activeColumnIndex + 1;
      }

      setActiveRowIndex(newRowIndex);
      setActiveColumnIndex(newColumnIndex);
      return;
    }
  };

  // Handle click on a line
  const handleLineClick = (lineIndex: number) => {
    setActiveRowIndex(lineIndex);

    // Get cursor position from selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    setActiveColumnIndex(selection.anchorOffset);
  };

  return (
    <div id="yazmak-editor" ref={editorRef}>
      <div id="yazmak-editor-content">
        {lines.map((line, index) => (
          <div className="yazmak-line">
            <div className="yazmak-line-number">{index + 1}</div>
            <div
              className="yazmak-line-content"
              key={`yazmak-line-${index}`}
              ref={(el) => {
                if (!el) return;
                lineRefs.current[index] = el;
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onInput={(e) => handleLineInput(e, index)}
              onClick={() => handleLineClick(index)}
              data-line-index={index}
              spellCheck={false}
            >
              {line}
            </div>
          </div>
        ))}
      </div>
      <div className="status-line">
        Column: {activeColumnIndex} Row: {activeRowIndex}
      </div>
    </div>
  );
}

export default CustomEditor;
