import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SurplusProvider } from "./context/SurplusContext";
import { I18nProvider } from "./i18n/I18nContext";
import router from "./router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <SurplusProvider>
          <RouterProvider router={router} />
        </SurplusProvider>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
