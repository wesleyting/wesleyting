import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".webp": "image/webp",
  ".xml": "application/xml",
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const relativePath = normalize(pathname === "/" ? "index.html" : pathname.slice(1));
  const filePath = join(root, relativePath);

  try {
    const file = await stat(filePath);
    if (!file.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    const notFoundPath = join(root, "404.html");

    try {
      await stat(notFoundPath);
      response.writeHead(404, { "Content-Type": "text/html" });
      createReadStream(notFoundPath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  }
});

server.listen(4173, "127.0.0.1");

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
