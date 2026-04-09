import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /ask and other API calls to your Express backend
// This eliminates CORS issues in development entirely
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      "/ask": "http://localhost:3000",
      "/bible": "http://localhost:3000", 
     // "/login": "http://localhost:3000",
     // "/register": "http://localhost:3000",
      "/random-verse": "http://localhost:3000",
      "/search": "http://localhost:3000",
      "/verse": "http://localhost:3000",
    },
  },
});