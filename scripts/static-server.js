"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json"
};

http.createServer((request, response) => {
    const requestPath = new URL(request.url, `http://${request.headers.host}`).pathname;
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const target = path.resolve(root, relativePath);

    if (!target.startsWith(root + path.sep)) {
        response.writeHead(403).end("Forbidden");
        return;
    }

    fs.readFile(target, (error, data) => {
        if (error) {
            response.writeHead(404).end("Not found");
            return;
        }
        response.writeHead(200, {
            "Content-Type": types[path.extname(target)] || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        response.end(data);
    });
}).listen(port, "127.0.0.1", () => {
    console.log(`Chandas development server: http://127.0.0.1:${port}`);
});
