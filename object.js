import { Vector2D } from "./vector2d.js";
const playerHeight = 90;

let tempId = 0;

export class Object {
  constructor({ x = 0, y = 0, w = 50, h = 50, type }) {
    this.id = tempId;
    this.width = w;
    this.height = h;
    this.pos = new Vector2D(x, y);
    this.type = type;
    tempId++;
  }
}

export const player = new Object({
  id: 0,
  x: 50,
  y: 0 - playerHeight - 100,
  w: 50,
  h: playerHeight,
});

export let objects = {
  content: [
    new Object({
      x: 0,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      x: 50,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      x: 100,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
    new Object({
      x: 150,
      y: 0,
      w: 50,
      h: 50,
      type: "grass_block",
    }),
  ],
};
