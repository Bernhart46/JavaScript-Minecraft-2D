"use script";

const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");
const fps = 30;
//Custom time
const tickSpeed = 40;

const gravity = 3;
const moveSpeed = 10;
let groundLevel = window.innerHeight - 50;
const playerHeight = 100;

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const player_pos = new Vector2D(
  window.innerWidth / 2,
  groundLevel - playerHeight
);
const CAMERA = new Vector2D(0, 0);
const velocity = new Vector2D(0, 0);

//ONLY FOR DRAWING NOT CALCULING!!! CALCULATIONS ARE FOR THE TICKS TO DECIDE NOT THE FPS
function draw() {
  //DRAW
  drawObject("blue", player_pos.x, player_pos.y, 50, playerHeight);

  //TEST OBJECT
  drawObject("red", 150, groundLevel - 50, 50, 50);

  //GROUND
  drawObject("green", 0, groundLevel, window.innerWidth, 50);

  //COORDS
  ctx.fillText(`X: ${player_pos.x}`, 10, 20);
  ctx.fillText(`Y: ${-player_pos.y + groundLevel - playerHeight}`, 10, 40);
}

function drawObject(style, x, y, w, h) {
  ctx.fillStyle = style;
  ctx.fillRect(x - CAMERA.x, y, w, h);
}

//Reason why it's separate from draw: Because in here, it calculates without being affected by the fps!
function calculate() {
  //GRAVITY
  if (player_pos.y < groundLevel - playerHeight - velocity.y) {
    velocity.y = velocity.y + gravity;
  } else {
    velocity.y = 0;
    // player_pos.y = groundLevel - playerHeight;
  }
  //REGISTERING MOVEMENT
  player_pos.x = player_pos.x + velocity.x;
  player_pos.y = player_pos.y + velocity.y;
  CAMERA.x = CAMERA.x + velocity.x;
  //SLOWING DOWN X (NOT TO GO FOREVER)
  if (velocity.x < 0) {
    velocity.x++;
  }
  if (velocity.x > 0) {
    velocity.x--;
  }

  //KEY ACTIONS HERE!!!
  if (keyPressed["Space"] || keyPressed["KeyW"]) {
    if (player_pos.y === groundLevel - playerHeight) {
      velocity.y = velocity.y - 30;
    }
  }

  if (keyPressed["KeyD"]) {
    velocity.x = moveSpeed;
  }
  if (keyPressed["KeyA"]) {
    velocity.x = -moveSpeed;
  }
}

const keyPressed = {};

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

//ANIMATE (fps)
function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}

animate();

function gameTime() {
  setInterval(calculate, 1000 / tickSpeed);
}

gameTime();
