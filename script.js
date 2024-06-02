"use script";
import { objects, player } from "./object.js";
import { Vector2D } from "./vector2d.js";

const canvas = document.querySelector("#myCanvas");
export const ctx = canvas.getContext("2d");
const fps = 30; //Default: 30
//Custom time
const tickSpeed = 50; //Default: 40
const keyPressed = {};
let zoom = 1; //Default : 1

export let groundLevel = window.innerHeight - 50;
const gravity = 3; //Default: 3
const moveSpeed = 8; //Default: 8
const jumpHeight = 30; //Default: 30
export const playerHeight = 100; //Default: 100

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

const CAMERA = new Vector2D(0, 0);
const velocity = new Vector2D(0, 0);

//Reason why it's separate from draw: Because in here, it calculates without being affected by the fps!
function calculate() {
  //Stop coordinates
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
    velocity.y += gravity;
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

  //REGISTERING MOVEMENT
  player.pos.x += velocity.x;
  CAMERA.x = -(window.innerWidth / zoom / 2 - player.pos.x - player.width / 2);
  CAMERA.y = -(
    window.innerHeight / zoom / 2 -
    player.pos.y -
    player.height / 2
  );

  //SLOWING DOWN X (NOT TO GO FOREVER)
  if (velocity.x < 0) {
    velocity.x += 1;
  }
  if (velocity.x > 0) {
    velocity.x -= 1;
  }
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

  groundLevel = window.innerHeight - 50;
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

function gameTime() {
  calculate();

  setTimeout(() => {
    requestAnimationFrame(gameTime);
  }, 1000 / tickSpeed);
}

gameTime();

//ONLY FOR DRAWING NOT CALCULING!!! CALCULATIONS ARE FOR THE TICKS TO DECIDE NOT THE FPS
function draw() {
  drawObject(
    player.color,
    player.pos.x,
    player.pos.y,
    player.width,
    player.height
  );
  for (let object of objects) {
    const { color, pos, width, height } = object;
    drawObject(color, pos.x, pos.y, width, height);
  }

  //COORDS
  ctx.fillStyle = "black";
  ctx.fillText(`Player_X: ${player.pos.x}`, 10, 20);
  ctx.fillText(
    `Player_Y: ${-player.pos.y + groundLevel - playerHeight}`,
    10,
    40
  );
  ctx.fillText(`Velocity_X: ${velocity.x}`, 10, 60);
  ctx.fillText(`Velocity_Y: ${velocity.y}`, 10, 80);
  ctx.fillText(`Camera_X: ${CAMERA.x.toFixed(1)}`, 10, 100);
  ctx.fillText(`Camera_Y: ${CAMERA.y.toFixed(1)}`, 10, 120);
  ctx.fillText(`Zoom: ${zoom.toFixed(1)}`, 10, 140);
  ctx.fillText(`Controls: A,S,D + W or Space`, 10, 160);
}

function drawObject(style, x, y, w, h) {
  ctx.fillStyle = style;
  ctx.fillRect(
    x * zoom - CAMERA.x * zoom,
    y * zoom - CAMERA.y * zoom,
    w * zoom,
    h * zoom
  );
}

//ANIMATE (fps)
function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}

animate();
