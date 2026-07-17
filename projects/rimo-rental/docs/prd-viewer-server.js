const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT_DIR = __dirname;
const PRD_DIR = ROOT_DIR;
const PORT = Number(process.env.PORT || 8080);
const collator = new Intl.Collator("zh-Hans-CN", { numeric: true, sensitivity: "base" });

const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml; charset=utf-8",
    ".webp": "image/webp"
};

function scanMarkdownFiles() {
    const files = [];

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith(".")) continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }
            if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md") continue;

            const relativePath = path.relative(PRD_DIR, fullPath).replace(/\\/g, "/");
            const folderPath = path.dirname(relativePath).replace(/\\/g, "/");
            const group = folderPath === "." ? "PRD" : folderPath.split("/").join(" / ");
            const title = path.basename(entry.name, ".md").replace(/^\d+[_-]/, "");
            files.push({ group, title, path: relativePath });
        }
    }

    walk(PRD_DIR);
    files.sort((a, b) => {
        const groupCompare = collator.compare(a.group, b.group);
        if (groupCompare !== 0) return groupCompare;
        return collator.compare(a.title, b.title);
    });
    return files;
}

function sendJson(res, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(body);
}

function sendNotFound(res) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
}

function serveStatic(reqUrl, res) {
    const pathname = decodeURIComponent(reqUrl.pathname);
    const relativePath = pathname === "/" ? "PRD阅读器.html" : pathname.replace(/^\/+/, "");
    const filePath = path.normalize(path.join(ROOT_DIR, relativePath));
    const rootWithSep = ROOT_DIR.endsWith(path.sep) ? ROOT_DIR : `${ROOT_DIR}${path.sep}`;

    if (filePath !== ROOT_DIR && !filePath.startsWith(rootWithSep)) {
        sendNotFound(res);
        return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        sendNotFound(res);
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && reqUrl.pathname === "/api/prd-md-files") {
        sendJson(res, {
            generatedAt: new Date().toISOString(),
            root: "PRD",
            files: scanMarkdownFiles()
        });
        return;
    }

    if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Method not allowed");
        return;
    }

    serveStatic(reqUrl, res);
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`PRD viewer: http://127.0.0.1:${PORT}/PRD阅读器.html`);
    console.log("Markdown files are scanned each time the page loads or reloads.");
});
