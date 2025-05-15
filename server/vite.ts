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
  const clientBuildDir = path.resolve(__dirname, '..', 'dist', 'client');
  
  if (!fs.existsSync(clientBuildDir)) {
    log(`Warning: Client build directory ${clientBuildDir} not found, looking for alternative paths...`);
    
    // Try alternate paths that might exist in production
    const alternativePaths = [
      path.resolve(__dirname, '..', 'public'),
      path.resolve(__dirname, 'public'),
      path.resolve(__dirname, '..', 'dist', 'public')
    ];
    
    const existingPath = alternativePaths.find(p => fs.existsSync(p));
    
    if (existingPath) {
      log(`Found alternative static files path: ${existingPath}`);
      app.use(express.static(existingPath));
      
      // Serve index.html for any route not matched
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(existingPath, "index.html"));
      });
      
      return;
    } else {
      log('Warning: Could not find any static files directory. Static content may not be served correctly.');
    }
  } else {
    app.use(express.static(clientBuildDir));
    
    // Serve index.html for any route not matched
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(clientBuildDir, "index.html"));
    });
  }
}
