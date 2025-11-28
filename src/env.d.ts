/// <reference types="vite/client" />

// Declaraciones mínimas para las variables de entorno de Vite usadas en el proyecto.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // añadir aquí otras variables VITE_ si es necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
