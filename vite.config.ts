import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  build: {
    cssMinify: false,
  },
  plugins: [
    tanstackStart({
      server: {
        entry: "server",
      },
    }),
    tailwindcss(),
    react(),
  ],
});
