// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/ask": "http://localhost:3000",
      "/random-verse": "http://localhost:3000",
      "/search": "http://localhost:3000",
      "/verse": "http://localhost:3000",
    },
  },
  // ✅ This is the correct Vite way to handle SPA routing on reload
  appType: "spa",
});