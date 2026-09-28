import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-serif/400.css";
import "@fontsource/noto-serif/700.css";
import "@fontsource/noto-serif/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/700.css";
import "@fontsource/ibm-plex-mono/400-italic.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Không tìm thấy phần tử #root trong index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
