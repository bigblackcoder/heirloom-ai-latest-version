import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Check all possible build directories in production
  const possiblePaths = [
    path.resolve(__dirname, '..', 'dist', 'client'),
    path.resolve(__dirname, '..', 'dist', 'public'),
    path.resolve(__dirname, '..', 'public'),
    path.resolve(__dirname, 'public')
  ];
  
  // Log all possible paths for debugging
  possiblePaths.forEach(p => {
    log(`Checking static path: ${p} - Exists: ${fs.existsSync(p)}`);
  });
  
  const existingPath = possiblePaths.find(p => fs.existsSync(p));
  
  if (existingPath) {
    log(`Serving static files from: ${existingPath}`);
    
    // Serve static files
    app.use(express.static(existingPath));
    
    // Check if index.html exists in the static directory
    const indexPath = path.resolve(existingPath, "index.html");
    if (fs.existsSync(indexPath)) {
      log(`Found index.html at: ${indexPath}`);
      
      // Serve index.html for any route not matched by other routes or static files
      app.use("*", (req, res) => {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(404).json({ error: 'API endpoint not found' });
        }
        log(`Serving index.html for: ${req.originalUrl}`);
        res.sendFile(indexPath);
      });
    } else {
      log(`WARNING: index.html not found in ${existingPath}`);
    }
  } else {
    log('ERROR: Could not find any static files directory. Static content cannot be served.');
    // Return a helpful message for any non-API route
    app.use("*", (req, res) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.status(500).send('Server configuration error: Static files not found. Please check build configuration.');
    });
  }
}
