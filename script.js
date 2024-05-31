"use script";
import { objects, player } from "./object.js";
import { Vector2D } from "./vector2d.js";

const canvas = document.querySelector("#myCanvas");
export const ctx = canvas.getContext("2d");
const fps = 30;
//Custom time
const tickSpeed = 40;
const keyPressed = {};
let zoom = 1;

export let groundLevel = window.innerHeight - 50;
const gravity = 3;
const moveSpeed = 8;
export const playerHeight = 100;

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

const CAMERA = new Vector2D(0, 0);
const velocity = new Vector2D(0, 0);

//Reason why it's separate from draw: Because in here, it calculates without being affected by the fps!
function calculate() {
  //COLLISION
  let stopTopY;
  let stopTopX;
  let stopLeftX;
  let stopRightX;
  const playerBottom = player.pos.y + player.height + velocity.y;
  const playerTop = player.pos.y + velocity.y;
  for (let obj of objects) {
    const isCollidedY =
      obj.pos.y <= playerBottom && playerTop <= obj.pos.y + obj.height;
    const isCollidedTopX =
      player.pos.x + player.width - 5 >= obj.pos.x &&
      obj.pos.x + obj.width >= player.pos.x + 5;
    const isUnder = player.pos.y >= obj.pos.y + obj.height;
    const isAbove = player.pos.y + player.height <= obj.pos.y;
    const isCollidedLeft =
      player.pos.x + player.width + 5 >= obj.pos.x &&
      player.pos.x + player.width + 5 <= obj.pos.x + obj.width;
    const isCollidedRight =
      player.pos.x - 5 <= obj.pos.x + obj.width &&
      player.pos.x - 5 >= obj.pos.x;

    if (isCollidedY && isCollidedTopX) {
      stopTopY = obj.pos.y;
      stopTopX = obj.pos.x;
    }

    if (isCollidedLeft && !isAbove && !isUnder) {
      stopLeftX = obj.pos.x;
    }
    if (isCollidedRight && !isAbove && !isUnder) {
      stopRightX = obj.pos.x + obj.width;
    }
  }
  if (!stopTopY && !stopTopX) {
    velocity.y += gravity;
    player.pos.y += velocity.y;
  } else {
    velocity.y = 0;
    player.pos.y = stopTopY - player.height - velocity.y;
  }

  //KEY ACTIONS HERE!!!
  if (keyPressed["Space"] || keyPressed["KeyW"]) {
    if (!isNaN(stopTopY)) {
      velocity.y -= 30;
    }
  }
  if (keyPressed["KeyD"]) {
    if (!stopLeftX) {
      velocity.x = moveSpeed;
    } else {
      velocity.x = 0;
      player.pos.x = stopLeftX - player.width - velocity.x;
    }
  }
  if (keyPressed["KeyA"]) {
    if (!stopRightX) {
      velocity.x = -moveSpeed;
    } else {
      velocity.x = 0;
      player.pos.x = stopRightX - velocity.x;
    }
  }
  player.pos.x += velocity.x;

  //REGISTERING MOVEMENT
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
  setInterval(calculate, 1000 / tickSpeed);
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
  ctx.fillText(`P_X: ${player.pos.x}`, 10, 20);
  ctx.fillText(`P_Y: ${-player.pos.y + groundLevel - playerHeight}`, 10, 40);
  ctx.fillText(`C_X: ${CAMERA.x}`, 10, 60);
  ctx.fillText(`C_Y: ${CAMERA.y}`, 10, 80);
  ctx.fillText(`Zoom: ${zoom.toFixed(1)}`, 10, 100);
  ctx.fillText(`Controls: A,S,D + W or Space`, 10, 120);
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
