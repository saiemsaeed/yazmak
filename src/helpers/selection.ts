import { CursorHandlerReturnType } from "../types/handlers";

// Function to select all content in the editor, excluding line numbers
export const handleSelectAll = (
  lineRefs: HTMLDivElement[],
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  // Get the first and last lines
  const firstLine = lineRefs[0];
  const lastLine = lineRefs[lines.length - 1];

  if (!firstLine || !lastLine) {
    return { rowIndex: activeRowIndex, columnIndex: activeColumnIndex, lines };
  }

  const selection = window.getSelection();
  if (!selection) {
    return { rowIndex: activeRowIndex, columnIndex: activeColumnIndex, lines };
  }

  // Create a range from start of first line to end of last line
  const range = document.createRange();

  // Set start at beginning of first line
  if (firstLine.firstChild) {
    range.setStart(firstLine.firstChild, 0);
  } else {
    range.setStart(firstLine, 0);
  }

  // Set end at the end of last line
  if (lastLine.firstChild && lastLine.textContent) {
    range.setEnd(lastLine.firstChild, lastLine.textContent.length);
  } else {
    range.setEnd(lastLine, lastLine.childNodes.length);
  }

  // Apply the selection
  selection.removeAllRanges();
  selection.addRange(range);

  return {
    rowIndex: lines.length - 1,
    columnIndex: lines[lines.length - 1].length,
    lines,
  };
};
