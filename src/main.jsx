import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Editor from "./CustomEditor";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div style={{ width: "100vw", height: "100vh" }}>
      <Editor
        initialText={`Testh
sdfsdfds
sdfsdfds`}
      />
    </div>
  </StrictMode>,
);
