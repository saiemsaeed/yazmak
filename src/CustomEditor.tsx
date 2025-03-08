import React, { useEffect, useRef, useState } from "react";
import { KEY_BINDINGS } from "./constants/key-bindings";
import "./CustomEditor.css";

type Config = {};

type CustomEditorProps = {
  initialText: string;
  config?: {};
  vimCursor: boolean;
};

const EDITOR_MODES = {
  NORMAL: "NORMAL",
  INSERT: "INSERT",
};

function CustomEditor({
  initialText,
  config,
  vimCursor = false,
}: CustomEditorProps) {
  const [lines, setLines] = useState(initialText.split("\n"));
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const editorRef = useRef(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);

  const updateVimCurosr = (vimCursor: boolean, range: Range) => {
    if (!vimCursor) return;
    const charDimensions = getCharacterDimensions(
      range.endContainer,
      range.endOffset,
    );
    const rect = range.getBoundingClientRect();
    const cursor = document.getElementById("yazmak-vim-cursor");
    // Position the cursor element
    if (cursor) {
      cursor.style.left = `${rect.left}px`;
      cursor.style.top = `${rect.top - 2}px`;
      cursor.style.width = `${charDimensions.width}px`;
      cursor.style.height = `${charDimensions.height}px`;
    }
  };

  useEffect(() => {
    if (!isTextSelected && lineRefs.current[activeRowIndex]) {
      const lineElement = lineRefs.current[activeRowIndex];

      if (!lineElement) return;

      // Create the cursor element

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
      } else {
        // If there's no text content
        range.setStart(lineElement, 0);
        range.setEnd(lineElement, 0);
      }

      updateVimCurosr(vimCursor, range);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [activeRowIndex, activeColumnIndex, lines, isTextSelected]);

  function getCharacterDimensions(node, offset) {
    // Default dimensions
    let width = 0;
    let height = 0;

    // Handle text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      // Get the parent element's computed style
      const parentStyle = window.getComputedStyle(node.parentNode);

      // Get the font metrics
      const fontSize = parseFloat(parentStyle.fontSize);
      const lineHeight = parseFloat(parentStyle.lineHeight) || fontSize * 1.2;
      height = lineHeight;

      // Check if we're at the end of the text node
      const isAtEnd = offset >= node.textContent.length;

      // Check if we're on a whitespace character
      const isWhitespace =
        !isAtEnd && /\s/.test(node.textContent.charAt(offset));

      // Create a temporary span to measure character width
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";

      // Copy all text-related styles
      for (const prop of [
        "font",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "fontStyle",
        "letterSpacing",
      ]) {
        tempSpan.style[prop] = parentStyle[prop];
      }

      if (isAtEnd || isWhitespace) {
        // For whitespace or end of text, measure a standard character first
        tempSpan.textContent = "M";
        document.body.appendChild(tempSpan);
        width = tempSpan.getBoundingClientRect().width;
        document.body.removeChild(tempSpan);

        // If it's a space, adjust the width
        if (!isAtEnd && node.textContent.charAt(offset) === " ") {
          // Create another span to measure space width
          const spaceSpan = document.createElement("span");
          spaceSpan.style.visibility = "hidden";
          spaceSpan.style.position = "absolute";
          for (const prop of [
            "font",
            "fontFamily",
            "fontSize",
            "fontWeight",
            "fontStyle",
            "letterSpacing",
          ]) {
            spaceSpan.style[prop] = parentStyle[prop];
          }

          // Measure the width of text with and without a space
          spaceSpan.textContent = "a";
          document.body.appendChild(spaceSpan);
          const widthWithoutSpace = spaceSpan.getBoundingClientRect().width;

          spaceSpan.textContent = "a ";
          const widthWithSpace = spaceSpan.getBoundingClientRect().width;

          document.body.removeChild(spaceSpan);

          // The space width is the difference
          width = widthWithSpace - widthWithoutSpace;

          // Ensure minimum width for visibility
          width = Math.max(width, fontSize * 0.25);
        }

        // For tab characters, make the cursor wider
        if (!isAtEnd && node.textContent.charAt(offset) === "\t") {
          width *= 4; // Typical tab size is 4 spaces
        }
      } else {
        // For normal visible characters, use the actual character
        tempSpan.textContent = node.textContent.charAt(offset);
        document.body.appendChild(tempSpan);
        width = tempSpan.getBoundingClientRect().width;
        document.body.removeChild(tempSpan);
      }
    } else {
      // For element nodes
      const style = window.getComputedStyle(node);
      const fontSize = parseFloat(style.fontSize);
      height = parseFloat(style.lineHeight) || fontSize * 1.2;

      // For empty elements or cursor at the end
      const tempSpan = document.createElement("span");
      for (const prop of [
        "font",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "fontStyle",
        "letterSpacing",
      ]) {
        tempSpan.style[prop] = style[prop];
      }

      tempSpan.textContent = "M";
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";

      document.body.appendChild(tempSpan);
      width = tempSpan.getBoundingClientRect().width;
      document.body.removeChild(tempSpan);
    }

    // Ensure minimum width
    width = Math.max(width, 1);

    return { width, height };
  }

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

    // Add a function to handle the Enter key
    if (e.key === KEY_BINDINGS.NEW_LINE) {
      e.preventDefault();

      const newLines = [...lines];
      const newLine = newLines[activeRowIndex];
      const newContent = newLine.slice(0, activeColumnIndex);
      const remainingContent = newLine.slice(activeColumnIndex);

      newLines[activeRowIndex] = newContent;
      newLines.splice(activeRowIndex + 1, 0, remainingContent);

      setLines(newLines);

      setActiveRowIndex(activeRowIndex + 1);
      setActiveColumnIndex(0);
      return;
    }

    // Handle Backspace key such that on line end it should merge with previous lines
    // Not sure how to keep it in the KEY_BINDINGS object
    if (
      e.key === "Backspace" &&
      activeColumnIndex === 0 &&
      activeRowIndex > 0
    ) {
      e.preventDefault();

      const newLines = [...lines];
      const newLine = newLines[activeRowIndex];
      const previousLine = newLines[activeRowIndex - 1];

      newLines[activeRowIndex - 1] = previousLine + newLine;
      newLines.splice(activeRowIndex, 1);

      setLines(newLines);

      setActiveRowIndex(activeRowIndex - 1);
      setActiveColumnIndex(previousLine.length);
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

    // handle move word forward with option key + right arrow
    if (e.key === KEY_BINDINGS.MOVE_RIGHT && e.altKey) {
      e.preventDefault();

      let newRowIndex = activeRowIndex;
      let newColumnIndex = activeColumnIndex;
      const currentLine = lines[activeRowIndex];

      if (
        activeColumnIndex === currentLine.length &&
        activeRowIndex < lines.length - 1
      ) {
        newRowIndex = activeRowIndex + 1;
        newColumnIndex = 0;
      } else {
        newColumnIndex = currentLine.indexOf(" ", activeColumnIndex + 1);

        if (newColumnIndex === -1) {
          newColumnIndex = currentLine.length;
        }
      }

      setActiveRowIndex(newRowIndex);
      setActiveColumnIndex(newColumnIndex);
      return;
    }

    // handle move word backward with option key + left arrow
    if (e.key === KEY_BINDINGS.MOVE_LEFT && e.altKey) {
      e.preventDefault();

      let newRowIndex = activeRowIndex;
      let newColumnIndex = activeColumnIndex;
      const currentLine = lines[activeRowIndex];

      if (activeColumnIndex === 0 && activeRowIndex > 0) {
        newRowIndex = activeRowIndex - 1;
        newColumnIndex = lines[newRowIndex].length;
      } else {
        newColumnIndex = currentLine.lastIndexOf(" ", activeColumnIndex - 1);

        if (newColumnIndex === -1) {
          newColumnIndex = 0;
        }
      }

      setActiveRowIndex(newRowIndex);
      setActiveColumnIndex(newColumnIndex);
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
        <div id="yazmak-vim-cursor" />
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
