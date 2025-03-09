export const createKeyMap = (
  key: string,
  meta: boolean,
  ctrl: boolean,
  alt: boolean,
  shift: boolean,
): string | undefined => {
  if (key === "") return undefined;

  let keyMap: string = "";
  if (meta) {
    keyMap += `Meta+`;
  }
  if (ctrl) {
    keyMap += `Ctrl+`;
  }
  if (alt) {
    keyMap += `Alt+`;
  }
  if (shift) {
    keyMap += `Shift+`;
  }
  keyMap += key;

  return keyMap;
};
