import React, { useEffect, useRef, useState } from "react";
import { KEY_BINDINGS } from "./constants/key-bindings";
import "./CustomEditor.css";
import {
  handleCreateNewLine,
  handleDeleteLine,
  handleMoveDown,
  handleMoveLeft,
  handleMoveNextWord,
  handleMovePrevWord,
  handleMoveRight,
  handleMoveUp,
} from "./helpers/cursor-handler";
import { createKeyMap } from "./helpers/global";

type Config = {};

type CustomEditorProps = {
  initialText: string;
  config?: {};
  vimMode: boolean;
};

const EDITOR_MODES = {
  NORMAL: "NORMAL",
  INSERT: "INSERT",
};

function CustomEditor({
  initialText,
  config,
  vimMode = false,
}: CustomEditorProps) {
  const [lines, setLines] = useState<string[]>(initialText.split("\n"));
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const editorRef = useRef(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const [editorMode, setEditorMode] = useState(EDITOR_MODES.NORMAL);

  const updateVimCurosr = (vimMode: boolean, range: Range) => {
    if (!vimMode) return;
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

      updateVimCurosr(vimMode, range);
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
      {
      }
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

    const selection = window.getSelection();
    if (!selection) return;

    setActiveColumnIndex(selection.anchorOffset);
  };

  const handleChangeCursorPositon = (
    func: (
      lines: string[],
      activeRowIndex: number,
      activeColumnIndex: number,
    ) => { rowIndex: number; columnIndex: number; lines: string[] },
  ) => {
    const {
      rowIndex,
      columnIndex,
      lines: newLines,
    } = func(lines, activeRowIndex, activeColumnIndex);

    setActiveRowIndex(rowIndex);
    setActiveColumnIndex(columnIndex);

    // If lines reference is updated, then we should update lines, otherwise not, to avoid rerenders.
    if (newLines !== lines) {
      setLines(newLines);
    }
    return;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const KEY_PRESSED = createKeyMap(
      e.key,
      e.metaKey,
      e.ctrlKey,
      e.altKey,
      e.shiftKey,
    );

    // Handle special key bindings
    switch (KEY_PRESSED) {
      case KEY_BINDINGS.MOVE_UP:
        e.preventDefault();
        handleChangeCursorPositon(handleMoveUp);
        return;
      case KEY_BINDINGS.MOVE_DOWN:
        e.preventDefault();
        handleChangeCursorPositon(handleMoveDown);
        return;
      case KEY_BINDINGS.NEW_LINE:
        e.preventDefault();
        handleChangeCursorPositon(handleCreateNewLine);
        return;
      case KEY_BINDINGS.DELETE_LINE:
        if (activeColumnIndex == 0) {
          e.preventDefault();
          handleChangeCursorPositon(handleDeleteLine);
        }
        return;
      case KEY_BINDINGS.MOVE_LEFT:
        e.preventDefault();
        handleChangeCursorPositon(handleMoveLeft);
        return;
      case KEY_BINDINGS.MOVE_RIGHT:
        e.preventDefault();
        handleChangeCursorPositon(handleMoveRight);
        return;
      case KEY_BINDINGS.MOVE_NEXT_WORD:
        e.preventDefault();
        handleChangeCursorPositon(handleMoveNextWord);
        return;
      case KEY_BINDINGS.MOVE_PREV_WORD:
        e.preventDefault();
        handleChangeCursorPositon(handleMovePrevWord);
        return;
      case KEY_BINDINGS.CHANGE_MODE_NORMAL:
        e.preventDefault();
        setEditorMode(EDITOR_MODES.NORMAL);
        return;
      case KEY_BINDINGS.CHANGE_MODE_INSERT:
        e.preventDefault();
        setEditorMode(EDITOR_MODES.INSERT);
        return;
      default:
        // For normal keys, let the default behavior occur to allow text input
        if (editorMode === EDITOR_MODES.INSERT) {
          // Allow text input in INSERT mode
          return;
        } else {
          // Prevent text input in NORMAL mode
          e.preventDefault();
          return;
        }
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
              onKeyDown={(e) => handleKeyDown(e)}
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
        <span>
          {editorMode} | Column: {activeColumnIndex} Row: {activeRowIndex}
        </span>
      </div>
    </div>
  );
}

export default CustomEditor;
