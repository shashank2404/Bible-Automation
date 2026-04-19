// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy: {
    //   "/api": "https://bible-automation-1.onrender.com",
    //   "/ask": "https://bible-automation-1.onrender.com",
    //   "/random-verse": "https://bible-automation-1.onrender.com",
    //   "/search": "https://bible-automation-1.onrender.com",
    //   "/verse": "https://bible-automation-1.onrender.com",
    // },
  },
  appType: "spa",
});