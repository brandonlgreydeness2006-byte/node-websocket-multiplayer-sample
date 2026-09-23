const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const publicDir = path.join(__dirname, "public");
const players = new Map();

const server = http.createServer((req, res) => {
  const requested = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404).end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

function snapshot() {
  return { type: "state", players: [...players.values()] };
}

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
}

function validCoordinate(value) {
  return Number.isFinite(value) && value >= 15 && value <= 785;
}

wss.on("connection", (socket) => {
  const id = crypto.randomUUID();
  players.set(id, {
    id,
    name: `Player ${players.size + 1}`,
    x: 100 + Math.floor(Math.random() * 500),
    y: 100 + Math.floor(Math.random() * 300)
  });

  socket.send(JSON.stringify({ type: "welcome", id }));
  broadcast(snapshot());

  socket.on("message", (raw) => {
    let message;
    try { message = JSON.parse(raw); } catch { return; }

    const player = players.get(id);
    if (!player) return;

    if (message.type === "move" &&
        validCoordinate(message.x) &&
        validCoordinate(message.y)) {
      player.x = message.x;
      player.y = message.y;
      broadcast(snapshot());
    }

    if (message.type === "name" && typeof message.name === "string") {
      const cleaned = message.name.trim().slice(0, 20);
      if (cleaned) {
        player.name = cleaned;
        broadcast(snapshot());
      }
    }
  });

  socket.on("close", () => {
    players.delete(id);
    broadcast(snapshot());
  });
});

server.listen(PORT, () => {
  console.log(`Multiplayer sample running at http://localhost:${PORT}`);
});
