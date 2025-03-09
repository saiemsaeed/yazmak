export type CursorHandlerArgs = {
  lines: string[];
  activeRowIndex: number;
  activeColumnIndex: number;
};

export type CursorHandlerReturnType = {
  rowIndex: number;
  columnIndex: number;
  lines: string[];
};
