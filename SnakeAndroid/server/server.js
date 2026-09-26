import http from "node:http";
import { WebSocketServer } from "ws";
import crypto from "node:crypto";

const PORT = Number(process.env.PORT || 8080);
const rooms = new Map();

function roomId() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function send(ws, message) {
  if (ws.readyState === 1) ws.send(JSON.stringify(message));
}

function broadcast(room, sender, message) {
  for (const peer of room.players) {
    if (peer !== sender) send(peer, message);
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, {"content-type":"application/json","cache-control":"no-store"});
    res.end(JSON.stringify({ok:true, rooms:rooms.size}));
    return;
  }
  res.writeHead(200, {"content-type":"text/plain"});
  res.end("Snake Online server");
});

const wss = new WebSocketServer({ server });

wss.on("connection", ws => {
  ws.room = null;

  ws.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === "create") {
      if (ws.room) return;
      const id = roomId();
      const room = { players: new Set([ws]), states: new Map() };
      rooms.set(id, room);
      ws.room = id;
      send(ws, {type:"room", room:id});
      return;
    }

    if (msg.type === "join") {
      if (ws.room) return;
      const id = String(msg.room || "").toUpperCase();
      const room = rooms.get(id);
      if (!room || room.players.size >= 2) {
        send(ws, {type:"error", message:"Комната не найдена или заполнена"});
        return;
      }
      room.players.add(ws);
      ws.room = id;
      send(ws, {type:"joined", room:id});
      broadcast(room, ws, {type:"peer_joined"});
      // Сразу отдаём новому игроку последнее состояние уже подключённого игрока.
      for (const peer of room.players) {
        if (peer !== ws && peer.lastState) {
          send(ws, {type:"state", player:peer.lastState});
        }
      }
      return;
    }

    if (msg.type === "state") {
      if (!ws.room) return;
      const room = rooms.get(ws.room);
      if (!room) return;
      // Храним последнее состояние именно этого соединения.
      ws.lastState = msg.player;
      room.states.set(ws, msg.player);
      broadcast(room, ws, {type:"state", player:msg.player});
    }
  });

  ws.on("close", () => {
    if (!ws.room) return;
    const room = rooms.get(ws.room);
    if (!room) return;
    room.players.delete(ws);
    room.states.delete(ws);
    broadcast(room, ws, {type:"peer_left"});
    if (room.players.size === 0) rooms.delete(ws.room);
  });
});

server.listen(PORT, () => console.log("Snake Online server listening on " + PORT));
