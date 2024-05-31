import { Vector2D } from "./vector2d.js";
let groundLevel = window.innerHeight - 50;
const playerHeight = 100;

export class Object {
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
    this.width = w;
    this.height = h;
    this.pos = new Vector2D(x, y);
  }
}

export const player = new Object({
  id: 0,
  color: "blue",
  x: window.innerWidth / 3,
  y: groundLevel - playerHeight - 350,
  w: 50,
  h: playerHeight,
});

export const objects = [
  new Object({
    id: 1,
    color: "red",
    // x: 150,
    x: 400,
    y: groundLevel - 50,
    w: 50,
    h: 50,
  }),
  new Object({
    id: 3,
    color: "yellow",
    // x: 150,
    x: 250,
    y: groundLevel - 170,
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
  new Object({
    id: 4,
    color: "aqua",
    x: 500,
    y: groundLevel - 50,
    w: 50,
    h: 50,
  }),
  new Object({
    id: 5,
    color: "purple",
    x: 550,
    y: groundLevel - 50,
    w: 50,
    h: 50,
  }),
  new Object({
    id: 5,
    color: "orange",
    x: 600,
    y: groundLevel - 100,
    w: 50,
    h: 50,
  }),
  new Object({
    id: 5,
    color: "gray",
    x: 650,
    y: groundLevel - 150,
    w: 100,
    h: 50,
  }),
  new Object({
    id: 6,
    color: "pink",
    x: 0,
    y: groundLevel - 50,
    w: 50,
    h: 50,
  }),
];
