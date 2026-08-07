import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
   content: ["./index.html", "./src/**/*.{js,jsx}"],
  plugins: [react()],
});