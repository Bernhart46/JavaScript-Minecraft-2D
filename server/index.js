import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { v4 } from "uuid";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, "../client/")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../client/index.html"));
});

//GAME
class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Object {
  constructor({ id, x = 0, y = 0, w = 50, h = 50, type }) {
    this.id = v4();
    this.width = w;
    this.height = h;
    this.pos = new Vector2D(x, y);
    this.type = type;
  }
}

class Player {
  constructor() {
    this.id = v4();
    this.height = 90;
    this.width = 50;
    this.pos = {
      x: 50,
      y: 0 - this.height - 100,
    };
  }
}

let players = [];
let messages = [];

let objects = {
  content: [
    new Object({
      id: 0,
      x: 0,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      id: 1,
      x: 50,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      id: 2,
      x: 100,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      id: 3,
      x: 150,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
  ],
};

let time = 7 * 60 * 60;

function gameTime() {
  setInterval(() => {
    if (time + 60 >= 86400) {
      time = 0;
    } else {
      time += 60;
    }
  }, 1000);
}

gameTime();

//IO
io.on("connection", (socket) => {
  console.log("user connected");
  const newPlayer = new Player();
  players.push(newPlayer);

  socket.emit("init", {
    objects,
    players,
    id: newPlayer.id,
    time,
    messages: messages.slice(-12),
  });
  socket.broadcast.emit("user_joined", newPlayer);

  //BLOCKS
  socket.on("place_block_to_server", (args) => {
    const obj = new Object(args);
    objects.content.push(obj);
    io.emit("place_block_to_client", obj);
  });

  socket.on("remove_block_to_server", (args) => {
    objects.content = objects.content.filter((x) => x.id !== args);
    io.emit("remove_block_to_client", args);
  });

  //MOVEMENT
  socket.on("set_pos", (pos) => {
    newPlayer.pos = pos;

    socket.broadcast.emit("get_pos", { id: newPlayer.id, pos });
  });

  //MESSAGES
  socket.on("send_message", ({ id, message }) => {
    messages.push({ id, message });
    io.emit("get_message", { id, message });
  });

  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== newPlayer.id);

    io.emit("user_left", newPlayer.id);
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
