import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      output: {
        // Splits the heaviest, rarely-changing vendor libraries into their
        // own cacheable chunks instead of one 1MB+ bundle shipped on every
        // visit regardless of which page is actually loaded - KaTeX and
        // Clerk in particular are only needed once the user reaches
        // /study, not on the marketing homepage.
        manualChunks: {
          katex: ["katex", "react-markdown", "remark-math", "remark-gfm", "rehype-katex", "rehype-raw"],
          clerk: ["@clerk/react"],
          "vendor-react": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});