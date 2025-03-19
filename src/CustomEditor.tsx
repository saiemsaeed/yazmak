import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { KEY_BINDINGS } from "./constants/key-bindings";
import {
  handleCreateNewLine,
  handleDeleteLine,
  handleDeleteWordBackwards,
  handleDeleteWordForward,
  handleMoveDown,
  handleMoveLeft,
  handleMoveNextWord,
  handleMovePrevWord,
  handleMoveRight,
  handleMoveUp,
} from "./helpers/cursor-handler";
import { createKeyMap } from "./helpers/global";
import { copyToClipboard, pasteFromClipboard } from "./helpers/clipboard";
import { handleSelectAll } from "./helpers/selection";

import "./CustomEditor.css";

type Config = {
  showLineNumbers: boolean;
  vimMode: boolean;
  showStatusbar?: boolean;
};

type CustomEditorProps = {
  initialText: string;
  config?: Config;
  lineRenderer: (line: string, index: number, isRaw: boolean) => any;
};

const EDITOR_MODES = {
  NORMAL: "NORMAL",
  INSERT: "INSERT",
};

function CustomEditor({
  initialText,
  config = { showLineNumbers: false, vimMode: false },
  lineRenderer,
}: CustomEditorProps) {
  const { showLineNumbers, showStatusbar = false } = config;

  const [lines, setLines] = useState<string[]>(
    initialText.split("\n").map((line) => line.trimEnd()),
  );
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const lineNumberRefs = useRef<HTMLDivElement[]>([]);
  const [editorMode, setEditorMode] = useState(EDITOR_MODES.INSERT);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  useEffect(() => {
    console.log("lines", lines);
  }, [lines]);

  // Focus cursor at the end of content when editor initializes
  useLayoutEffect(() => {
    if (editorRef.current && lines.length > 0) {
      // Find the last line with content
      let lastLineWithContentIndex = lines.length - 1;
      while (
        lastLineWithContentIndex >= 0 &&
        !lines[lastLineWithContentIndex]
      ) {
        lastLineWithContentIndex--;
      }

      // If all lines are empty, use the first line
      const targetLineIndex = Math.max(0, lastLineWithContentIndex);
      const targetColumnIndex = lines[targetLineIndex]?.length || 0;

      // Update cursor position
      setActiveRowIndex(targetLineIndex);
      setActiveColumnIndex(targetColumnIndex);
    }
  }, []);

  // Maintain Minimum Number of Lines (50)
  // Improve it by moving to a function and calling it when needed
  useLayoutEffect(() => {
    if (lines.length < 50) {
      const newLines = [...lines];
      for (let i = lines.length; i < 50; i++) {
        newLines.push("");
      }
      setLines(newLines);
    }
  }, [lines]);

  const isTextSelected = () => {
    const selection = window.getSelection();
    return selection ? selection.toString() !== "" : false;
  };

  useEffect(() => {
    const activeLineRef = lineRefs.current[activeRowIndex];
    const activeLineNumberRef = lineNumberRefs.current[activeRowIndex];

    // Remove active line class from all Lines
    lineRefs.current.forEach((lineRef) =>
      lineRef?.classList.remove("yazmak-active-line"),
    );

    // Remove active line class from all Line numbers
    lineNumberRefs.current.forEach((lineNumberRef) =>
      lineNumberRef?.classList.remove("yazmak-active-line"),
    );

    activeLineRef?.classList.add("yazmak-active-line");
    activeLineNumberRef?.classList.add("yazmak-active-line");
  }, [activeRowIndex]);

  useEffect(() => {
    const selection = window.getSelection();
    if (!selection) return;

    const activeLineRef = lineRefs.current[activeRowIndex];

    if (!isTextSelected() && activeLineRef) {
      // Focus the line
      activeLineRef.focus();

      // Set cursor position
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      if (!range) return;

      // Helper function to find the appropriate text node and offset
      const findTextNodeAndOffset = (
        element: Node,
        targetOffset: number,
      ): { node: Node; offset: number } => {
        // Handle empty element case
        if (!element.textContent || element.textContent.length === 0) {
          return { node: element, offset: 0 };
        }

        // If this is a text node, return it directly
        if (element.nodeType === Node.TEXT_NODE) {
          return {
            node: element,
            offset: Math.min(targetOffset, element.textContent.length),
          };
        }

        // Navigate through child nodes
        let currentOffset = 0;
        for (let i = 0; i < element.childNodes.length; i++) {
          const child = element.childNodes[i];
          const childLength = child.textContent?.length || 0;

          // If target position is in this child node
          if (currentOffset + childLength >= targetOffset) {
            // If it's a text node, position cursor within it
            if (child.nodeType === Node.TEXT_NODE) {
              return {
                node: child,
                offset: targetOffset - currentOffset,
              };
            }
            // Otherwise, recursively find position in this child
            return findTextNodeAndOffset(child, targetOffset - currentOffset);
          }

          currentOffset += childLength;
        }

        // If we get here, position at the end of the last text node
        const lastChild = element.lastChild;
        if (lastChild?.nodeType === Node.TEXT_NODE) {
          return {
            node: lastChild,
            offset: lastChild.textContent?.length || 0,
          };
        }

        // Fall back to the element itself
        return { node: element, offset: 0 };
      };

      if (activeLineRef.textContent) {
        // If there's text content, find the appropriate position
        const position = Math.min(
          activeColumnIndex,
          activeLineRef.textContent.length || 0,
        );

        const { node, offset } = findTextNodeAndOffset(activeLineRef, position);
        range.setStart(node, offset);
        range.setEnd(node, offset);
      } else {
        // If there's no text content
        range.setStart(activeLineRef, 0);
        range.setEnd(activeLineRef, 0);
      }

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [activeRowIndex, activeColumnIndex, lines]);

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
      lineRefs: HTMLDivElement[],
      lines: string[],
      activeRowIndex: number,
      activeColumnIndex: number,
    ) => { rowIndex: number; columnIndex: number; lines: string[] },
  ) => {
    const {
      rowIndex,
      columnIndex,
      lines: newLines,
    } = func(lineRefs.current, lines, activeRowIndex, activeColumnIndex);

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
      case KEY_BINDINGS.DELETE:
        if (activeColumnIndex == 0) {
          e.preventDefault();
          handleChangeCursorPositon(handleDeleteLine);
        } else if (isTextSelected()) {
          e.preventDefault();
          const selection = window.getSelection();
          if (!selection) return;

          const range = selection.getRangeAt(0);
          range.deleteContents();
          editorRef.current?.setAttribute("contentEditable", "false");
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
      case KEY_BINDINGS.CHANGE_MODE_NORMAL &&
        editorMode === EDITOR_MODES.INSERT:
        e.preventDefault();
        setEditorMode(EDITOR_MODES.NORMAL);
        return;
      case KEY_BINDINGS.CHANGE_MODE_INSERT &&
        editorMode === EDITOR_MODES.NORMAL:
        e.preventDefault();
        setEditorMode(EDITOR_MODES.INSERT);
        return;
      case KEY_BINDINGS.DELETE_WORD_BACKWARDS:
        e.preventDefault();
        handleChangeCursorPositon(handleDeleteWordBackwards);
        return;
      case KEY_BINDINGS.DELETE_WORD_FORWARD:
        e.preventDefault();
        handleChangeCursorPositon(handleDeleteWordForward);
        return;
      case KEY_BINDINGS.SELECT_ALL:
        e.preventDefault();
        handleChangeCursorPositon(handleSelectAll);
        return;
      case KEY_BINDINGS.COPY:
        e.preventDefault();
        copyToClipboard();
        return;
      case KEY_BINDINGS.PASTE:
        e.preventDefault();
        pasteFromClipboard().then((newLines) => {
          if (newLines && newLines.length > 0) {
            setLines((prevLines) => {
              const updatedLines = [...prevLines];

              // Handle the first line of the paste - insert at cursor position in current line
              const currentLine = updatedLines[activeRowIndex] || "";
              const beforeCursor = currentLine.substring(0, activeColumnIndex);
              const afterCursor = currentLine.substring(activeColumnIndex);

              // Replace current line with: text before cursor + first pasted line
              updatedLines[activeRowIndex] = beforeCursor + newLines[0];

              // If there are multiple lines being pasted
              if (newLines.length > 1) {
                // Insert the middle lines
                const middleLines = newLines.slice(1, newLines.length - 1);

                // Insert the last line + remainder of the current line
                const lastPastedLine =
                  newLines[newLines.length - 1] + afterCursor;

                // Insert all new lines at the right position
                updatedLines.splice(
                  activeRowIndex + 1,
                  0,
                  ...middleLines,
                  lastPastedLine,
                );
              } else {
                // Single line paste - append the remainder of the original line
                updatedLines[activeRowIndex] += afterCursor;
              }

              // Update cursor position to end of pasted content
              setTimeout(() => {
                if (newLines.length > 1) {
                  // Move to the end of the last pasted line
                  setActiveRowIndex(activeRowIndex + newLines.length - 1);
                  setActiveColumnIndex(newLines[newLines.length - 1].length);
                } else {
                  // Stay on same line, but move cursor forward
                  setActiveColumnIndex(activeColumnIndex + newLines[0].length);
                }
              }, 0);

              return updatedLines;
            });
          }
        });
        return;
      default:
        return;
    }
  };

  const handleMouseDown = (_e: React.MouseEvent, _lineIndex: number) => {
    editorRef.current?.setAttribute("contentEditable", "true");
  };

  const handleMouseUp = (_e: React.MouseEvent, lineIndex: number) => {
    editorRef.current?.setAttribute("contentEditable", "false");
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    setActiveRowIndex(lineIndex);
    setActiveColumnIndex(selection.focusOffset);
  };

  const handleLineClick = (_e: React.MouseEvent, lineIndex: number) => {
    const currentLineRef = lineRefs.current[lineIndex];
    currentLineRef.focus();

    // Get cursor position from selection
    const selection = window.getSelection();
    if (!selection) return;

    setActiveRowIndex(lineIndex);
    setActiveColumnIndex(selection.focusOffset);
  };

  const handleMouseMove = (_e: React.MouseEvent, lineIndex: number) => {
    const currentLineRef = lineRefs.current[lineIndex];
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    setActiveColumnIndex(selection.focusOffset);
    if (currentLineRef === selectionRange?.startContainer.parentElement) {
      setActiveRowIndex(lineIndex);
    }

    const range = selection.getRangeAt(0);
    setSelectionRange(range);
  };

  return (
    <div id="yazmak-editor">
      <div
        id="yazmak-editor-area"
        contentEditable={false}
        suppressContentEditableWarning={false}
        ref={editorRef}
      >
        {showLineNumbers && (
          <div id="yazmak-editor-lines" contentEditable={false}>
            {lines.map((_, index) => (
              <div
                ref={(el) => {
                  if (!el) return;
                  lineNumberRefs.current[index] = el;
                }}
                className="yazmak-line-number"
                key={`yazmak-line-${index}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}
        <div id="yazmak-editor-content">
          <div id="yazmak-vim-cursor" />
          {lines.map((line, index) => (
            <div
              className="yazmak-line-content"
              style={{ gridRow: index + 1 }}
              key={`yazmak-line-${index}`}
              ref={(el) => {
                if (!el) return;
                lineRefs.current[index] = el;
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onKeyDown={(e) => handleKeyDown(e)}
              onInput={(e) => handleLineInput(e, index)}
              onClick={(e) => handleLineClick(e, index)}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onMouseUp={(e) => handleMouseUp(e, index)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              data-line-index={index}
              dangerouslySetInnerHTML={{
                __html: lineRenderer(line, index, index === activeRowIndex),
              }}
            />
          ))}
        </div>
      </div>
      {showStatusbar && (
        <div className="status-line">
          <span>
            {editorMode} | Column: {activeColumnIndex} Row: {activeRowIndex}
          </span>
        </div>
      )}
    </div>
  );
}

export default CustomEditor;
