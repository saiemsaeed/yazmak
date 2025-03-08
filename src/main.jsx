import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Editor from "./CustomEditor";

const initialText = `This is the Testing Initial Text
## This is the Heading 2
### this is the heading 3


























































































`;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div style={{ width: "100vw", height: "100vh" }}>
      <Editor initialText={initialText} />
    </div>
  </StrictMode>,
);
