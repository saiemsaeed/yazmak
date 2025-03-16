import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Editor from "./CustomEditor";
import "./index.css";

const initialText = `This is the Testing Initial Text
## This is the Heading 2
### this is the heading 3




`;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alighItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "750px",
          marginTop: "8px",
          marginBottom: "8px",
          borderRadius: "4px",
          boxShadow: "0 0 0 1px rgba(16,22,26,.1), 0 2px 4px rgba(16,22,26,.2)",
          overflow: "hidden",
        }}
      >
        <Editor
          initialText={initialText}
          config={{
            showLineNumbers: false,
          }}
        />
      </div>
    </div>
  </StrictMode>,
);
