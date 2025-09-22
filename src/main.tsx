import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import NewTab from "./pages/NewTab.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {window.location.pathname === "/newtab.html" ? <NewTab /> : <App />}
    </StrictMode>
);
