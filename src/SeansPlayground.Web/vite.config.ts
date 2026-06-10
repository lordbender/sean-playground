import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const repositoryRoot = path.resolve(__dirname, "..", "..");

export default defineConfig({
  plugins: [react(), documentationPlugin()],
  server: {
    port: 3000,
    strictPort: true
  }
});

function documentationPlugin() {
  return {
    name: "seans-playground-documentation",
    resolveId(id: string) {
      return id === "virtual:documentation" ? id : null;
    },
    load(id: string) {
      if (id !== "virtual:documentation") {
        return null;
      }

      const documents = [
        readDocument("README", "README.md", "README.md"),
        ...readDocsFolder()
      ];

      return `export const documents = ${JSON.stringify(documents)};`;
    }
  };
}

function readDocsFolder() {
  const docsPath = path.join(repositoryRoot, "docs");

  if (!fs.existsSync(docsPath)) {
    return [];
  }

  return fs
    .readdirSync(docsPath)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => readDocument(toTitle(fileName), `docs/${fileName}`, path.join("docs", fileName)));
}

function readDocument(title: string, sourcePath: string, filePath: string) {
  return {
    id: sourcePath.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase(),
    title,
    sourcePath,
    content: fs.readFileSync(path.join(repositoryRoot, filePath), "utf8")
  };
}

function toTitle(fileName: string) {
  return fileName
    .replace(/\.md$/i, "")
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
