import "dotenv/config";

import express from "express";
import expressWs from "express-ws";

import WebSocket from "ws"; // for upstream AIS

const app = express();
expressWs(app);

app.use(express.json());

const clients = new Set();

function heartbeat() {
  this.isAlive = true;
}
function startHeartbeat(wsServer) {
  setInterval(() => {
    for (const ws of wsServer.getWss().clients) {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);
}

app.get("/", (req, res) => {
  res.send("Hello");
});

app.ws("/ws", (ws, req) => {
  ws.isAlive = true;
  ws.on("pong", heartbeat);

  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

// ---- Upstream AIS connection (single long-lived socket)
const upstream = new WebSocket("wss://stream.aisstream.io/v0/stream");

upstream.on("open", () => {
  upstream.send(
    JSON.stringify({
      APIKey: process.env.AIS_API_KEY,
      BoundingBoxes: [
        [
          [37.768918, -122.383801],
          [37.689562, -122.203083],
        ],
      ],
      FilterMessageTypes: ["PositionReport"],
    })
  );
  console.log("Subscribed to AIS");
});

upstream.on("message", (data, isBinary) => {
  const text = data.toString("utf8");
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(text);
    }
  }
});
upstream.on("error", (e) => console.error("AIS error:", e));
upstream.on("close", () => console.log("AIS closed"));

app.listen(3001, () =>
  console.log(`Server listening on http://localhost:3001`)
);

// Start heartbeat after express-ws is attached
startHeartbeat(expressWs(app));
