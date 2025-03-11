/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_JWT_STORAGE_KEY: string
    readonly VITE_ALLOWED_ORIGINS: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }