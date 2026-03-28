import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import ExcalidrawApp from "./App";

window.__EXCALIDRAW_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

const isElectron = import.meta.env.ELECTRON === "true";
if (!isElectron && import.meta.env.VITE_APP_ENABLE_PWA !== "false") {
  registerSW();
}

root.render(
  <StrictMode>
    <ExcalidrawApp />
  </StrictMode>,
);
