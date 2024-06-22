import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { v4 } from "uuid";
import fs from "fs";
import path from "path";

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
  setId(newId) {
    this.id = newId;
  }
  setName(newName = "Guest") {
    this.name = newName;
  }
}

let players = [];
let messages = [];
let playerNames = {};
let playerIDs = {};

let objects = {
  content: [
    new Object({
      id: 1,
      x: 0,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      id: 2,
      x: 50,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      id: 3,
      x: 100,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      id: 4,
      x: 150,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
  ],
};

let time = 7 * 60 * 60;

fs.readFile(path.join(__dirname, "saves", "save.json"), "utf8", (err, d) => {
  if (err) throw err;

  const data = JSON.parse(d);
  playerNames = data.playerNames;
  playerIDs = data.playerIDs;
  objects = data.objects;
  time = data.time;
});

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
  socket.on("init", (id) => {
    const newPlayer = new Player();
    const playerId = id === null ? v4() : id;
    newPlayer.setId(playerId);

    const isConnected = players.find((x) => x.id === playerId);

    if (isConnected) {
      socket.emit("already_connected");
      return;
    }
    newPlayer.setName(playerNames[playerId]);
    players.push(newPlayer);
    console.log(newPlayer.name + " connected");

    socket.emit("init_response", {
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
      console.log(newPlayer.name + " disconnected");
    });
    //CHAT COMMANDS
    socket.on("set_name", (newName) => {
      const usedName = playerIDs[newName];
      if (usedName) return;
      playerIDs[newName] = newPlayer.id;
      delete playerIDs[newPlayer.name];
      playerNames[newPlayer.id] = newName;
      newPlayer.setName(newName);
      io.emit("new_name_setted", { id, newName });
    });
    socket.on("set_time", (arg) => {
      let newTime;
      if (!isNaN(arg)) {
        newTime = parseInt(arg) * 60;
      } else {
        switch (arg) {
          case "morning":
            newTime = 7 * 60 * 60;
            break;
          case "noon":
            newTime = 12 * 60 * 60;
            break;
          case "afternoon":
            newTime = 15 * 60 * 60;
            break;
          case "evening":
            newTime = 18 * 60 * 60;
            break;
          case "night":
            newTime = 21 * 60 * 60;
            break;
          case "midnight":
            newTime = 0;
            break;
          default:
            newTime = 7 * 60 * 60;
            break;
        }
      }
      time = newTime;
      io.emit("new_time_setted", { newTime });
    });
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

//SAVE
process.on("SIGINT", () => {
  console.log("SAVING...");
  saveDataBeforeExit().then(() => {
    console.log("SAVED...");
    process.exit(0);
  });
});

async function saveDataBeforeExit() {
  await fs.promises.writeFile(
    path.join(__dirname, "saves", "save.json"),
    JSON.stringify({
      objects: objects,
      playerNames: playerNames,
      playerIDs: playerIDs,
      time: time,
    })
  );
}
