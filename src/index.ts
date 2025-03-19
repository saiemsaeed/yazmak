// Export the CSS directly
import "./CustomEditor.css";

// Export your main component(s)
export { default as CustomEditor } from "./CustomEditor";

// Export any types that consumers of your package might need
export type { EditorProps } from "./types";

// Export any utility functions that might be useful
import YazmakEditor from "./CustomEditor";

export { YazmakEditor };
