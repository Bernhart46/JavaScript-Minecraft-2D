import { Vector2D } from "./vector2d.js";
const playerHeight = 90;

let tempId = 0;

//Image assets
const grassImage = document.getElementById("grassImage");

export class Object {
  constructor({ x = 0, y = 0, w = 50, h = 50, image }) {
    this.id = tempId;
    this.width = w;
    this.height = h;
    this.pos = new Vector2D(x, y);
    this.image = image;
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
      image: grassImage,
    }),
    new Object({
      x: 50,
      y: 0,
      w: 50,
      h: 50,
      image: grassImage,
    }),
    new Object({
      x: 100,
      y: 0,
      w: 50,
      h: 50,
      image: grassImage,
    }),
    new Object({
      x: 150,
      y: 0,
      w: 50,
      h: 50,
      image: grassImage,
    }),
  ],
};
