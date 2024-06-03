"use script";
import { objects as objO, player } from "./object.js";
import { Vector2D } from "./vector2d.js";
import { addObject, getObject, removeObject } from "./game/game.js";

const canvas = document.querySelector("#myCanvas");
export const ctx = canvas.getContext("2d");
const fps = 30; //Default: 30
//Custom time
const tickSpeed = 40; //Default: 40
const keyPressed = {};
let zoom = 1; //Default : 1

const gravity = 3; //Default: 3
const moveSpeed = 8; //Default: 8
const jumpHeight = 30; //Default: 30
export const playerHeight = 100; //Default: 100

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

const CAMERA = new Vector2D(0, 0);
const velocity = new Vector2D(0, 0);
const origin = new Vector2D(0, 0);
const mouse = new Vector2D(0, 0);
const cursor = new Vector2D(0, 0);

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
  keyPressed[e.code] = true;
});

window.addEventListener("keyup", (e) => {
  delete keyPressed[e.code];
});

//RESIZE EVENT
window.addEventListener("resize", () => {
  canvas.setAttribute("width", window.innerWidth);
  canvas.setAttribute("height", window.innerHeight);
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

window.addEventListener("keypress", (e) => {
  if (e.code !== "KeyR") return;

  velocity.y = 0;
  player.pos.x = 50;
  player.pos.y = -200;
});

window.addEventListener("click", () => {
  if (zoom !== 1) return;
  const x = Math.round(cursor.x - origin.x);
  const y = Math.round(cursor.y - origin.y);

  const id = getObject(x, y)?.id;
  if (id) {
    removeObject(id);
  }
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (zoom !== 1) return;

  const x = Math.round(cursor.x - origin.x);
  const y = Math.round(cursor.y - origin.y);
  addObject(x, y);
});

function gameTime() {
  setInterval(calculate, 1000 / tickSpeed);
}

gameTime();

//ONLY FOR DRAWING NOT CALCULING!!! CALCULATIONS ARE FOR THE TICKS TO DECIDE NOT THE FPS
function draw() {
  const objects = objO.content;
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
  }
}

function drawInfo() {
  const cursor_block_x = Math.floor((cursor.x - origin.x) / 50);
  const cursor_block_y = Math.floor((cursor.y - origin.y) / 50);

  //COORDS
  ctx.fillStyle = "black";
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
}

function drawCursor() {
  if (zoom !== 1) return;
  ctx.strokeStyle = "red";
  ctx.strokeRect(
    cursor.x - velocity.x,
    cursor.y - velocity.y,
    50 * zoom,
    50 * zoom
  );
}
function calculateCursor() {
  const m_x = mouse.x - origin.x - velocity.x;
  const m_y = mouse.y - origin.y - velocity.y;
  cursor.x = origin.x + Math.floor(m_x / 50) * 50;
  cursor.y = origin.y + Math.floor(m_y / 50) * 50;
}

//ANIMATE (fps)
function animate() {
  ctx.fillStyle = "#82EEFD";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}
animate();

function calculateCollisions() {
  const objects = objO.content;
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
}

calculateCamera();
