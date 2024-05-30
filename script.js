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
const CAMERA = new Vector2D(0, 0);
const velocity = new Vector2D(0, 0);

class Object {
  constructor({
    id = Date.now(),
    color = "black",
    x = 0,
    y = 0,
    w = 50,
    h = 50,
  }) {
    this.id = id;
    this.color = color;
    this.pos = new Vector2D(x, y);
    this.width = w;
    this.height = h;
  }
}
const player = new Object({
  id: 0,
  color: "blue",
  x: window.innerWidth / 2,
  y: groundLevel - playerHeight,
  w: 50,
  h: playerHeight,
});
const objects = [
  player,
  new Object({
    id: 1,
    color: "red",
    x: 150,
    y: groundLevel - 50,
    w: 50,
    h: 50,
  }),
  new Object({
    id: 2,
    color: "green",
    x: 0,
    y: groundLevel,
    w: window.innerWidth,
    h: 50,
  }),
];

//ONLY FOR DRAWING NOT CALCULING!!! CALCULATIONS ARE FOR THE TICKS TO DECIDE NOT THE FPS
function draw() {
  for (let object of objects) {
    const { color, pos, width, height } = object;
    drawObject(color, pos.x, pos.y, width, height);
  }

  //COORDS
  ctx.fillText(`X: ${player.pos.x}`, 10, 20);
  ctx.fillText(`Y: ${-player.pos.y + groundLevel - playerHeight}`, 10, 40);
}

function drawObject(style, x, y, w, h) {
  ctx.fillStyle = style;
  ctx.fillRect(x - CAMERA.x, y, w, h);
}

//Reason why it's separate from draw: Because in here, it calculates without being affected by the fps!
function calculate() {
  //GRAVITY
  if (player.pos.y < groundLevel - playerHeight - velocity.y) {
    velocity.y = velocity.y + gravity;
  } else {
    velocity.y = 0;
    // player.pos.y = groundLevel - playerHeight;
  }
  //REGISTERING MOVEMENT
  player.pos.x = player.pos.x + velocity.x;
  player.pos.y = player.pos.y + velocity.y;
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
    if (player.pos.y === groundLevel - playerHeight) {
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
