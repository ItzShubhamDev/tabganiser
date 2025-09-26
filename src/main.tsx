import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Layout from "./pages/Layout.tsx";
import App from "./App.tsx";
import "./assets/app.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {window.location.pathname === "/newtab.html" ? <Layout /> : <App />}
    </StrictMode>
);
