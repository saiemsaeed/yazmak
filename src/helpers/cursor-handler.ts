import { CursorHandlerReturnType } from "../types/handlers";

const handleMoveUp = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  const newRowIndex: number = Math.max(0, activeRowIndex - 1);
  const newRowLength = lines[newRowIndex].length;
  const newColumnIndex = Math.min(activeColumnIndex, newRowLength);

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

const handleMoveDown = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  const newRowIndex: number = Math.min(lines.length - 1, activeRowIndex + 1);
  const newRowLength = lines[newRowIndex].length;
  const newColumnIndex = Math.min(activeColumnIndex, newRowLength);

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

const handleCreateNewLine = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  const newRowIndex = activeRowIndex + 1;
  const newLines = [...lines];
  const newLine = newLines[activeRowIndex];
  const remainingContent = newLine.slice(0, activeColumnIndex);
  const newContent = newLine.slice(activeColumnIndex);

  newLines[activeRowIndex] = remainingContent;
  newLines.splice(newRowIndex, 0, newContent);

  return {
    rowIndex: newRowIndex,
    columnIndex: 0,
    lines: newLines,
  };
};

const handleDeleteLine = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  const newRowIndex = Math.min(0, activeRowIndex - 1);
  const newRows = [...lines];
  const newRow = newRows[newRowIndex];
  const lastRow = newRows[activeRowIndex];

  newRows[newRowIndex] = newRow + lastRow;
  newRows.splice(activeRowIndex, 1);

  const newColumnIndex = newRow.length;

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines: newRows,
  };
};

const handleMoveLeft = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  if (activeColumnIndex === 0 && activeRowIndex === 0) {
    return { rowIndex: activeRowIndex, columnIndex: activeColumnIndex, lines };
  }

  let newRowIndex = activeRowIndex;
  let newColumnIndex = activeColumnIndex;

  // handle if the cursor is at the beginning of the line and its not first line
  if (activeColumnIndex === 0 && activeRowIndex > 0) {
    newRowIndex = activeRowIndex - 1;
    newColumnIndex = lines[newRowIndex].length;
  } else {
    newColumnIndex = activeColumnIndex - 1;
  }

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

const handleMoveRight = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  let newRowIndex = activeRowIndex;
  let newColumnIndex = activeColumnIndex;

  // handle if the cursor is at the end of the line
  if (activeColumnIndex === lines[activeRowIndex].length) {
    newRowIndex = Math.min(lines.length - 1, activeRowIndex + 1);
    newColumnIndex = 0;
  } else if (activeColumnIndex < lines[activeRowIndex].length) {
    newColumnIndex = activeColumnIndex + 1;
  }

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

const handleMoveNextWord = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
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

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

const handleMovePrevWord = (
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
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

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

export {
  handleMoveUp,
  handleMoveDown,
  handleCreateNewLine,
  handleDeleteLine,
  handleMoveLeft,
  handleMoveRight,
  handleMoveNextWord,
  handleMovePrevWord,
};
