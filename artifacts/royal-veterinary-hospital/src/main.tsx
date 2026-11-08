import { createRoot } from "react-dom/client";

import App from "./App";
import { SiteProvider } from "./site-state";
import { LanguageProvider } from "./language";
import { ErrorBoundary } from "@/components/error-boundary";

import "./index.css";
import "./reference-hero.css";

createRoot(document.getElementById("root")!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <LanguageProvider>
      <SiteProvider>
        <App />
      </SiteProvider>
    </LanguageProvider>
  </ErrorBoundary>,
);
