import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { v4 } from "uuid";
import fs from "fs";
import path from "path";
console.clear();
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

class Player {
  constructor() {
    this.id = v4();
    this.height = 90;
    this.width = 50;
    this.pos = {
      x: 50,
      y: 0 - this.height - 150,
    };
  }
  setId(newId) {
    this.id = newId;
  }
  setName(newName = `Guest #${Math.floor(Math.random() * 1000) + 1}`) {
    this.name = newName;
  }
}

//temp objects instead of chunks (deprecated)
class Block {
  constructor({ id, x = 0, y = 0, w = 50, h = 50, type }) {
    this.id = v4();
    this.width = w;
    this.height = h;
    this.pos = new Vector2D(x, y);
    this.type = type;
  }
}
let objects = {
  content: [
    new Block({
      id: 1,
      x: 0,
      y: -100,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Block({
      id: 2,
      x: 50,
      y: -100,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Block({
      id: 3,
      x: 100,
      y: -100,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Block({
      id: 4,
      x: 150,
      y: -100,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
  ],
};
let players = [];
let messages = [];
let playerNames = {};
let playerIDs = {};

let positive_chunks = {
  //0th chunk -> chunk is from y 0 to y 255
  0: generateChunk(),
  1: generateChunk(),
};
let negative_chunks = {
  1: generateChunk(),
  2: generateChunk(),
};

// for testing
// for (const [key, value] of Object.entries({ 0: 1, 55: 3, 3: 2, 1: 2 })) {
//   console.log(`Key: ${key}, Value: ${value}`);
// }

// console.log(positive_chunks);
//TEMPORARY GENERATOR
function generateChunk() {
  const chunk = {
    0: { 0: 3, 1: 2, 2: 5 },
    1: { 0: 3, 1: 2, 2: 1 },
    2: { 0: 3, 1: 2, 2: 1 },
    3: { 0: 3, 1: 2, 2: 1, 6: 5, 7: 5 },
    4: { 0: 3, 1: 2, 2: 1, 6: 5, 7: 5, 8: 5, 9: 5 },
    5: { 0: 3, 1: 2, 2: 1, 3: 4, 4: 4, 5: 4, 6: 5, 7: 5, 8: 5, 9: 5 },
    6: { 0: 3, 1: 2, 2: 1, 6: 5, 7: 5, 8: 5, 9: 5 },
    7: { 0: 3, 1: 2, 2: 1, 6: 5, 7: 5 },
    8: { 0: 3, 1: 2, 2: 1 },
    9: { 0: 3, 1: 2, 2: 1 },
    10: { 0: 3, 1: 2, 2: 1 },
    11: { 0: 3, 1: 2, 2: 1 },
    12: { 0: 3, 1: 2, 2: 1 },
    13: { 0: 3, 1: 2, 2: 1 },
    14: { 0: 3, 1: 2, 2: 1 },
    15: { 0: 3, 1: 2, 2: 3 },
  };
  // for (let i = 0; i < 16; i++) {
  //   const column = { 0: 1, 6: 1, 7: 2 };
  //   chunk.push(column);
  // }

  return chunk;
}

let time = 7 * 60 * 60;

fs.readFile(path.join(__dirname, "saves", "save.json"), "utf8", (err, d) => {
  if (err) throw err;

  const data = JSON.parse(d);
  playerNames = data.playerNames;
  playerIDs = data.playerIDs;
  positive_chunks = data.positive_chunks;
  negative_chunks = data.negative_chunks;
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

function getDate() {
  const date = new Date();

  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  const hours = h < 10 ? `0${h}` : h;
  const minutes = m < 10 ? `0${m}` : m;
  const seconds = s < 10 ? `0${s}` : s;

  return `${hours}:${minutes}:${seconds}`;
}

//If interract with a chunk which doesn't exists, create it
function touchChunk(type, chunk, x) {
  if (type === 1) {
    if (positive_chunks[chunk] === undefined) {
      positive_chunks[chunk] = {};
    }
    if (positive_chunks[chunk][x] === undefined) {
      positive_chunks[chunk][x] = {};
    }
  } else {
    if (negative_chunks[chunk] === undefined) {
      negative_chunks[chunk] = {};
    }
    if (negative_chunks[chunk][x] === undefined) {
      negative_chunks[chunk][x] = {};
    }
  }
}

//IO
io.on("connection", (socket) => {
  socket.on("init", ({ id, chunks }) => {
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

    const chunksToSend = {
      positives: {},
      negatives: {}, //1 is the minimum
    };

    //CALCULATE CHUNKS
    const isPositive = newPlayer.pos.x > 0;
    const playerChunk = Math.floor(newPlayer.pos.x / 50 / 16);
    //-1 because of the arrays start with 0
    //IDK WHY I DON'T USE THIS: DELETE IF NOT NEEDED
    const minChunk = playerChunk - chunks;
    const maxChunk = playerChunk + chunks;

    //Positive chunks
    for (let i = 0; i <= chunks; i++) {
      if (positive_chunks[i]) {
        chunksToSend.positives[i] = positive_chunks[i];
      }
    }
    //Negative chunks
    for (let i = 1; i <= chunks; i++) {
      if (negative_chunks[i]) {
        chunksToSend.negatives[i] = negative_chunks[i];
      }
    }

    console.log(`${getDate()}: ${newPlayer.name} connected`);

    socket.emit("init_response", {
      objects,
      chunksToSend,
      players,
      id: newPlayer.id,
      time,
      messages: messages.slice(-12),
    });
    socket.broadcast.emit("user_joined", newPlayer);

    //BLOCKS
    socket.on("place_block_to_server", (args) => {
      const { isNegative, chunk, x, y, type } = args;

      if (isNegative) {
        touchChunk(0, chunk, x);
        if (!negative_chunks[chunk][x][y]) {
          negative_chunks[chunk][x][y] = type;
          io.emit("place_block_to_client", args);
        }
      } else {
        touchChunk(1, chunk, x);
        if (!positive_chunks[chunk][x][y]) {
          positive_chunks[chunk][x][y] = type;
          io.emit("place_block_to_client", args);
        }
      }

      // objects.content.push(obj);
    });

    socket.on("remove_block_to_server", (args) => {
      const { isNegative, chunk, x, y } = args;
      // objects.content = objects.content.filter((x) => x.id !== args);
      if (isNegative) {
        touchChunk(0, chunk, x);
        delete negative_chunks[chunk][x][y];
      } else {
        touchChunk(1, chunk, x);
        delete positive_chunks[chunk][x][y];
      }
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
      console.log(`${getDate()}: ${newPlayer.name} disconnected`);
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
  console.log(getDate() + ": Server running at http://localhost:3000");
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
      positive_chunks: positive_chunks,
      negative_chunks: negative_chunks,
      playerNames: playerNames,
      playerIDs: playerIDs,
      time: time,
    })
  );
}
