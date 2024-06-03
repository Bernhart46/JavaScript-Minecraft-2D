"use script";
import { objects as objO, player } from "./object.js";
import { Vector2D } from "./vector2d.js";
import { holdMouseAction, leftClick, rightClick, update } from "./game/game.js";
import { formatTime } from "./utils/formatTime.js";
import { getSkyColor } from "./game/getSkyColor.js";
import { getAlpha } from "./game/getAlpha.js";

const canvas = document.querySelector("#myCanvas");
export const ctx = canvas.getContext("2d");
const fps = 40; //Default: 30
//Custom time
const tickSpeed = 40; //Default: 40
export let time = 6 * 60 * 60;

export const keyPressed = {};
export let zoom = 1; //Default : 1

const gravity = 3; //Default: 3
const moveSpeed = 8; //Default: 8
const jumpHeight = 30; //Default: 30
export const playerHeight = 100; //Default: 100
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
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyR") {
    velocity.y = 0;
    player.pos.x = 50;
    player.pos.y = -200;
  }

  if (e.code === "F3") {
    isInfo = !isInfo;
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
  // const objects = objO.content;
  drawObject(player);
  for (let object of objects) {
    drawObject(object);
  }

  drawInfo();
  drawCursor();
}

function drawObject(obj) {
  const { pos, width: w, height: h } = obj;
  const color = obj?.color;
  const image = obj?.image;
  if (!image) {
    ctx.fillStyle = color || "black";
    ctx.fillRect(
      pos.x * zoom - CAMERA.x * zoom,
      pos.y * zoom - CAMERA.y * zoom,
      w * zoom,
      h * zoom
    );
  } else {
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

  //Ez itt működik :S setInterval-nál nem

  holdMouseAction();
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}
animate();

function calculateCollisions() {
  // const objects = objO.content;

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
  if (keyPressed["Space"] || keyPressed["KeyW"]) {
    if (playerBottom === closestTop && playerTop !== closestBottom) {
      velocity.y -= jumpHeight;
      //this is for preventing the player to jump "twice". Latency issue
      player.pos.y = player.pos.y - 1;
    }
  }
  //Move Right
  if (keyPressed["KeyD"]) {
    if (playerRight !== closestLeft) {
      velocity.x = moveSpeed;
    }
  }
  //Move Left
  if (keyPressed["KeyA"]) {
    if (playerLeft !== closestRight) {
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
  } else {
    velocity.y = 0;
    player.pos.y = closestTop - player.height;
  }
  //Roof hitting (player top hitting obj bottom)
  if (playerTop + velocity.y <= closestBottom) {
    velocity.y = 0;
    player.pos.y = closestBottom;
  }

  //PlayerRight hitting ObjLeft
  if (playerRight + velocity.x >= closestLeft) {
    velocity.x = 0;
    player.pos.x = closestLeft - player.width;
  }
  //PlayerLeft hitting ObjRight
  if (playerLeft + velocity.x <= closestRight) {
    velocity.x = 0;
    player.pos.x = closestRight;
  }
  player.pos.x += velocity.x;
  //SLOWING DOWN X (NOT TO GO FOREVER)
  if (velocity.x < 0) {
    velocity.x += 1;
  }
  if (velocity.x > 0) {
    velocity.x -= 1;
  }
}

function calculateCamera() {
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
