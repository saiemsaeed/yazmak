export const copyToClipboard = () => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  navigator.clipboard.writeText(selectedText);
};

export const pasteFromClipboard = async (): Promise<string[]> => {
  return navigator.clipboard.readText().then((text) => {
    const newLines = text.split("\n");
    return newLines;
  });
};
