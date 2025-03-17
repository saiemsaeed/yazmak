import { CursorHandlerReturnType } from "../types/handlers";

const handleMoveUp = (
  _lineRefs: HTMLDivElement[],
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
  _lineRefs: HTMLDivElement[],
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
  _lineRefs: HTMLDivElement[],
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
  _lineRefs: HTMLDivElement[],
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  if (activeRowIndex === 0 && activeColumnIndex === 0) {
    return { rowIndex: activeRowIndex, columnIndex: activeColumnIndex, lines };
  }
  const newRowIndex = Math.max(0, activeRowIndex - 1);
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
  _lineRefs: HTMLDivElement[],
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
  _lineRefs: HTMLDivElement[],
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
  __lineRefs: HTMLDivElement[],
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
  _lineRefs: HTMLDivElement[],
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

const handleDeleteWordBackwards = (
  _lineRefs: HTMLDivElement[],
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  let newRowIndex = activeRowIndex;
  let newColumnIndex = activeColumnIndex;
  const currentLine = lines[activeRowIndex];

  //handle if the cursor is at the beginning of the line
  if (activeColumnIndex === 0 && activeRowIndex > 0) {
    newRowIndex = activeRowIndex - 1;
    newColumnIndex = lines[newRowIndex].length;
  } else {
    //handle normal cursor position
    const lastSpaceIndex = currentLine.lastIndexOf(" ", activeColumnIndex - 2);

    lines[activeRowIndex] =
      currentLine.slice(0, lastSpaceIndex + 1) +
      currentLine.slice(activeColumnIndex);
    newColumnIndex = lastSpaceIndex + 1;
  }

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines,
  };
};

const handleDeleteWordForward = (
  _lineRefs: HTMLDivElement[],
  lines: string[],
  activeRowIndex: number,
  activeColumnIndex: number,
): CursorHandlerReturnType => {
  let newRowIndex = activeRowIndex;
  let newColumnIndex = activeColumnIndex;
  const currentLine = lines[activeRowIndex];
  const newLines = [...lines];

  //handle if the cursor is at the end of the line
  if (
    activeColumnIndex === currentLine.length &&
    activeRowIndex < lines.length - 1
  ) {
    const nextLine = newLines[activeRowIndex + 1];
    newLines[activeRowIndex] = currentLine + nextLine;
    newLines.splice(activeRowIndex + 1, 1);
  } else {
    //handle normal cursor position
    let nextSpaceIndex = currentLine.indexOf(" ", activeColumnIndex + 1);

    if (nextSpaceIndex === -1) {
      nextSpaceIndex = currentLine.length;
    }

    newLines[activeRowIndex] =
      currentLine.slice(0, activeColumnIndex) +
      currentLine.slice(nextSpaceIndex);

    newColumnIndex = activeColumnIndex;
  }

  return {
    rowIndex: newRowIndex,
    columnIndex: newColumnIndex,
    lines: newLines,
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
  handleDeleteWordBackwards,
  handleDeleteWordForward,
};
