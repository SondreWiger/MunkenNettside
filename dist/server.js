const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, HOST, () => {
    console.log(`[v0] Server running on http://${HOST}:${PORT}`);
    console.log(`[v0] Access locally: http://localhost:${PORT}`);
    if (HOST === "0.0.0.0") {
      console.log(`[v0] Access from network: http://<your-ip>:${PORT}`);
      console.log(`[v0] ✅ Camera access enabled on all network interfaces`);
    }
  });
});
