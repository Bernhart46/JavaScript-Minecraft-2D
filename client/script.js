"use script";
import { Vector2D } from "./vector2d.js";
import { holdMouseAction, leftClick, rightClick, update } from "./game/game.js";
import { formatTime } from "./utils/formatTime.js";
import { getSkyColor } from "./game/getSkyColor.js";
import { getAlpha } from "./game/getAlpha.js";
import { io } from "./lib/socket-io.js";
import { drawChat, changeTypingOn, isTypingOn } from "./game/chat.js";
const grassBlock = document.getElementById("grass_block");
const dirtBlock = document.getElementById("dirt_block");
const stoneBlock = document.getElementById("stone_block");

const blocks = {
  grass_block: grassBlock,
  dirt_block: dirtBlock,
  stone_block: stoneBlock,
};

export let blockType = "grass_block";

export const socket = io();
export let objO;
let players = [];
export let id;
let player;
export let time = 0;
export let messages = [];
export let message = "";
//SOCKETS
socket.on("init", (args) => {
  objO = args.objects;
  players = args.players;
  id = args.id;
  player = players.find((p) => p.id === id);
  time = args.time;
  messages = args.messages;
});

socket.on("get_pos", (args) => {
  const i = players.findIndex((p) => p.id === args.id);
  players[i].pos = args.pos;
});
socket.on("user_joined", (newPlayer) => {
  players.push(newPlayer);
});
socket.on("user_left", (id) => {
  players = players.filter((p) => p.id !== id);
});

socket.on("place_block_to_client", (args) => {
  objO.content.push(args);
});
socket.on("remove_block_to_client", (args) => {
  objO.content = objO.content.filter((obj) => obj.id !== args);
});
socket.on("get_message", ({ id, message }) => {
  messages.push({ id, message });
});

//VARIABLES
const canvas = document.querySelector("#myCanvas");
export const ctx = canvas.getContext("2d");
const fps = 30; //Default: 30
//Custom time
const tickSpeed = 40; //Default: 40

export const keyPressed = {};
export let zoom = 1; //Default : 1

const gravity = 3; //Default: 3
const moveSpeed = 8; //Default: 8
const jumpHeight = 30; //Default: 30
export const playerHeight = 90; //Default: 100
const reach = 6; //Default: 6
export let canReach = false;
let isInfo = true;

let objects = []; //ARRAY FOR OBJECTS

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

export const CAMERA = new Vector2D(0, 0);
export const CAMERA_ZOOMLESS = new Vector2D(0, 0);
export const velocity = new Vector2D(0, 0);
export const origin = new Vector2D(0, 0);
export const mouse = new Vector2D(0, 0);
export const cursor = new Vector2D(0, 0);

let cursor_block_x = 0;
let cursor_block_y = 0;

//Reason why it's separate from draw: Because in here, it calculates without being affected by the fps!
function calculate() {
  origin.x = 0 - CAMERA.x;
  origin.y = 0 - CAMERA.y;
  calculateCursor();

  calculateCollisions();
  calculateCamera();
}

//KEY EVENTS ONLY FOR REGISTERING, NOT ACTIVATING ACTIONS!!!
window.addEventListener("keydown", (e) => {
  e.preventDefault();
  keyPressed[e.code] = true;

  if (isTypingOn && e.key === "Backspace") {
    message = message.slice(0, -1);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyR" && !isTypingOn) {
    velocity.y = 0;
    player.pos.x = 50;
    player.pos.y = -200;
  }
  if (e.key === "Enter" && isTypingOn) {
    if (message.trim().length === 0) {
      message = "";
      changeTypingOn();
      return;
    }
    socket.emit("send_message", { id, message });
    message = "";
    changeTypingOn();
  }
  if (isTypingOn) {
    if (
      e.key === "Backspace" ||
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "AltGraph" ||
      e.key === "Tab" ||
      e.key === "CapsLock"
    )
      return;
    const allowedKeys =
      /[a-zA-Z0-9\s\b\t\`~!@#$%^&*()-_=+\[{\]}\|;:'",<.>/?áÁéÉíÍóÓúÚüÜűŰöÖőŐ]/;

    if (allowedKeys.test(e.key) && message.length <= 40) {
      message += e.key;
    }
  }

  if (e.code === "F3") {
    isInfo = !isInfo;
  }
  if (e.code === "F5") {
    location.reload();
  }
  if (e.code === "KeyT" && !isTypingOn) {
    changeTypingOn();
  }
  if (e.code === "Digit1" && !isTypingOn) {
    blockType = "grass_block";
  }
  if (e.code === "Digit2" && !isTypingOn) {
    blockType = "dirt_block";
  }
  if (e.code === "Digit3" && !isTypingOn) {
    blockType = "stone_block";
  }

  delete keyPressed[e.code];
});

//RESIZE EVENT
window.addEventListener("resize", () => {
  canvas.setAttribute("width", window.innerWidth);
  canvas.setAttribute("height", window.innerHeight);
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  rightClick();
});

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    keyPressed["mouseLeft"] = true;
    //The reason why this is in here and not in onclick event, is because onclick event
    //only works if I press down and up, in here it only needs to be down
    leftClick();
  }
  if (e.button === 2) {
    keyPressed["mouseRight"] = true;
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    delete keyPressed["mouseLeft"];
  }
  if (e.button === 2) {
    delete keyPressed["mouseRight"];
  }
});

window.addEventListener("wheel", (e) => {
  if (e.wheelDelta < 0) {
    if (zoom > 0.2) {
      zoom -= 0.1;
    }
  } else {
    zoom += 0.1;
  }
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function gameTime() {
  setInterval(() => {
    calculate();
  }, 1000 / tickSpeed);
  setInterval(() => {
    if (time + 60 >= 86400) {
      time = 0;
    } else {
      time += 60;
    }
  }, 1000);
}

gameTime();

//ONLY FOR DRAWING NOT CALCULING!!! CALCULATIONS ARE FOR THE TICKS TO DECIDE NOT THE FPS
function draw() {
  if (!player) return;
  // const objects = objO.content;
  for (let p of players) {
    const { pos, width, height } = p;
    const color = id === p.id ? "red" : "blue";
    drawObject({ pos, width, height, color });
  }
  for (let object of objects) {
    drawObject(object);
  }

  drawInfo();
  drawCursor();
}

function drawObject(obj) {
  const { pos, width: w, height: h } = obj;
  const color = obj?.color;
  const type = obj?.type;
  if (!type) {
    ctx.fillStyle = color || "black";
    ctx.fillRect(
      pos.x * zoom - CAMERA.x * zoom,
      pos.y * zoom - CAMERA.y * zoom,
      w * zoom,
      h * zoom
    );
  } else {
    let image = blocks[type];
    ctx.drawImage(
      image,
      pos.x * zoom - CAMERA.x * zoom,
      pos.y * zoom - CAMERA.y * zoom,
      w * zoom,
      h * zoom
    );
    //Shade of block

    const a = getAlpha(time);

    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(
      pos.x * zoom - CAMERA.x * zoom,
      pos.y * zoom - CAMERA.y * zoom,
      w * zoom,
      h * zoom
    );
  }
}

function drawInfo() {
  if (!player) return;
  cursor_block_x = Math.floor((cursor.x - origin.x) / 50);
  cursor_block_y = Math.floor((cursor.y - origin.y) / 50);
  //Check reach
  const playerx = Math.floor(player.pos.x / 50);
  const playery = Math.floor(player.pos.y / 50);

  let canReachx = false;
  let canReachy = false;
  if (cursor_block_x <= playerx) {
    canReachx = cursor_block_x - playerx >= -reach;
  }
  if (cursor_block_x >= playerx) {
    canReachx = cursor_block_x - playerx <= reach;
  }
  if (cursor_block_y >= playery) {
    canReachy = cursor_block_y - playery <= reach;
  }
  if (cursor_block_y <= playery) {
    canReachy = cursor_block_y - playery >= -reach;
  }
  canReach = canReachx && canReachy;

  if (!isInfo) return;
  //COORDS
  if (time <= 75000 && time >= 12000) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "white";
  }
  ctx.fillText(`Player_X: ${player.pos.x}`, 10, 20);
  ctx.fillText(`Player_Y: ${-player.pos.y - playerHeight}`, 10, 40);
  ctx.fillRect(10, 45, 150, 1);
  ctx.fillText(`Velocity_X: ${velocity.x}`, 10, 60);
  ctx.fillText(`Velocity_Y: ${velocity.y}`, 10, 80);
  ctx.fillRect(10, 85, 150, 1);
  ctx.fillText(`Camera_X: ${CAMERA.x.toFixed(1)}`, 10, 100);
  ctx.fillText(`Camera_Y: ${CAMERA.y.toFixed(1)}`, 10, 120);
  ctx.fillRect(10, 125, 150, 1);
  ctx.fillText(
    `Zoom: ${zoom.toFixed(1)} - IN-GAME CURSOR ONLY ON ZOOM 1.0`,
    10,
    140
  );
  ctx.fillRect(10, 145, 150, 1);
  ctx.fillText(`Controls: A,S,D + W or Space, R = reset player`, 10, 160);
  ctx.fillRect(10, 165, 150, 1);
  ctx.fillText(`Block_X: ${Math.floor(player.pos.x / 50)}`, 10, 180);
  ctx.fillText(
    `Block_Y: ${-Math.floor((player.pos.y + playerHeight) / 50)}`,
    10,
    200
  );
  ctx.fillRect(10, 205, 150, 1);
  ctx.fillText(`Cursor_Block_X: ${cursor_block_x}`, 10, 220);
  ctx.fillText(`Cursor_Block_Y: ${-cursor_block_y}`, 10, 240);
  ctx.fillRect(10, 245, 150, 1);
  ctx.fillText(`Time: ${formatTime(time)}`, 10, 260);
  ctx.fillRect(10, 265, 150, 1);
  ctx.fillText("You can turn this InfoBox off by pressing F3", 10, 280);
  ctx.fillText(`id: ${id}`, 10, 300);
  ctx.fillText(`Block: ${blockType} (change with numbers 1..3)`, 10, 320);
}

function drawCursor() {
  if (zoom !== 1) return;
  if (!canReach) return;
  ctx.strokeStyle = "red";
  ctx.strokeRect(cursor.x - velocity.x, cursor.y - velocity.y, 50, 50);
}
function calculateCursor() {
  const m_x = mouse.x - origin.x - velocity.x;
  const m_y = mouse.y - origin.y - velocity.y;
  cursor.x = origin.x + Math.floor(m_x / 50) * 50;
  cursor.y = origin.y + Math.floor(m_y / 50) * 50;
}

//ANIMATE (fps)
function animate() {
  ctx.fillStyle = getSkyColor(time);
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
  drawChat();

  //Ez itt működik :S setInterval-nál nem

  holdMouseAction();
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}
animate();

let hitBottom = false;
let hitLeft = false;
let hitRight = false;
let previousPosX = 0;

function calculateCollisions() {
  // const objects = objO.content;
  if (!objO) return;
  if (!player) return;
  objects = objO.content.filter((obj) => {
    if (
      obj.pos.x >= CAMERA_ZOOMLESS.x - 100 &&
      obj.pos.y >= CAMERA_ZOOMLESS.y - 100 &&
      obj.pos.x + obj.width <= window.innerWidth + CAMERA_ZOOMLESS.x + 100 &&
      obj.pos.y + obj.height <= window.innerHeight + CAMERA_ZOOMLESS.y + 100
    ) {
      return obj;
    }
  });
  let tops = [];
  let bottoms = [];
  let lefts = [];
  let rights = [];

  const playerBottom = player.pos.y + player.height;
  const playerTop = player.pos.y;
  const playerLeft = player.pos.x;
  const playerRight = player.pos.x + player.width;

  for (let obj of objects) {
    const objBottom = obj.pos.y + obj.height;
    const objTop = obj.pos.y;
    const objLeft = obj.pos.x;
    const objRight = obj.pos.x + obj.width;

    const isAbove =
      playerBottom <= objTop &&
      playerBottom < objBottom &&
      playerRight > objLeft &&
      playerLeft < objRight;

    const isUnder =
      playerTop >= objBottom &&
      playerTop > objTop &&
      playerRight > objLeft &&
      playerLeft < objRight;

    const isToRight =
      playerLeft > objLeft && playerTop < objBottom && playerBottom > objTop;

    const isToLeft =
      playerRight < objRight && playerTop < objBottom && playerBottom > objTop;

    if (isAbove) {
      tops.push(objTop);
    }
    if (isUnder) {
      bottoms.push(objBottom);
    }
    if (isToRight) {
      rights.push(objRight);
    }
    if (isToLeft) {
      lefts.push(objLeft);
    }
  }

  const closestTop = tops.length > 0 ? Math.min(...tops) : undefined;
  const closestBottom = bottoms.length > 0 ? Math.max(...bottoms) : undefined;
  const closestRight = rights.length > 0 ? Math.max(...rights) : undefined;
  const closestLeft = lefts.length > 0 ? Math.min(...lefts) : undefined;

  ///KEY ACTIONS HERE!!!
  //Jump
  if ((keyPressed["Space"] || keyPressed["KeyW"]) && !isTypingOn) {
    if (playerBottom === closestTop && playerTop !== closestBottom) {
      velocity.y -= jumpHeight;
      //this is for preventing the player to jump "twice". Latency issue
      player.pos.y = player.pos.y - 1;
    }
  }
  //Move Right
  if (keyPressed["KeyD"] && !isTypingOn) {
    if (playerRight !== closestLeft) {
      hitRight = false;
      velocity.x = moveSpeed;
    }
  }
  //Move Left
  if (keyPressed["KeyA"] && !isTypingOn) {
    if (playerLeft !== closestRight) {
      hitLeft = false;
      velocity.x = -moveSpeed;
    }
  }
  //Gravity | Falling
  if (
    playerBottom + velocity.y + gravity <= closestTop ||
    closestTop === undefined
  ) {
    if (velocity.y < 30) {
      velocity.y += gravity;
    }
    player.pos.y += velocity.y;
    socket.emit("set_pos", player.pos);
    hitBottom = false;
  } else {
    if (!hitBottom) {
      velocity.y = 0;
      player.pos.y = closestTop - player.height;
      socket.emit("set_pos", player.pos);
    }
    hitBottom = true;
  }
  //Roof hitting (player top hitting obj bottom)
  if (playerTop + velocity.y <= closestBottom) {
    velocity.y = 0;
    player.pos.y = closestBottom;
    socket.emit("set_pos", player.pos);
  }

  //PlayerRight hitting ObjLeft
  if (playerRight + velocity.x >= closestLeft) {
    if (!hitRight) {
      velocity.x = 0;
      player.pos.x = closestLeft - player.width;
      socket.emit("set_pos", player.pos);
    }
    hitRight = true;
  }
  //PlayerLeft hitting ObjRight
  if (playerLeft + velocity.x <= closestRight) {
    if (!hitLeft) {
      velocity.x = 0;
      player.pos.x = closestRight;
      socket.emit("set_pos", player.pos);
    }
    hitLeft = true;
  }

  //Velocity to X (basic movement)
  player.pos.x += velocity.x;
  if (player.pos.x !== previousPosX) {
    socket.emit("set_pos", player.pos);
  }
  previousPosX = player.pos.x;

  //SLOWING DOWN X (NOT TO GO FOREVER)
  if (velocity.x < 0) {
    velocity.x += 1;
    socket.emit("set_pos", player.pos);
  }
  if (velocity.x > 0) {
    velocity.x -= 1;
    socket.emit("set_pos", player.pos);
  }
}

function calculateCamera() {
  if (!player) return;
  //REGISTERING MOVEMENT
  CAMERA.x = -(window.innerWidth / zoom / 2 - player.pos.x - player.width / 2);
  CAMERA.y = -(
    window.innerHeight / zoom / 2 -
    player.pos.y -
    player.height / 2
  );

  CAMERA_ZOOMLESS.x = -(
    window.innerWidth / 2 -
    player.pos.x -
    player.width / 2
  );
  CAMERA_ZOOMLESS.y = -(
    window.innerHeight / 2 -
    player.pos.y -
    player.height / 2
  );
}

calculateCamera();
