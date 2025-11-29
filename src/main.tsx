

import { createRoot } from "react-dom/client";
import "./init"; // ← Inicializar dashboard primero
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
    