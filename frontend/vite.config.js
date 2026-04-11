import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      "/api": "http://localhost:3000",      // ← ADD THIS (covers /api/bible/notes etc.)
      "/ask": "http://localhost:3000",
     // "/bible": "http://localhost:3000",
      "/random-verse": "http://localhost:3000",
      "/search": "http://localhost:3000",
      "/verse": "http://localhost:3000",
    },
  },
});