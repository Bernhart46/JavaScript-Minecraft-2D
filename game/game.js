import { Object, objects } from "../object.js";
import {
  origin,
  cursor,
  zoom,
  keyPressed,
  velocity,
  canReach,
} from "../script.js";

//Block Images
const grassImage = document.getElementById("grassImage");

//Variables
const prevCursorPos = {
  x: 0,
  y: 0,
};

export function getObject(x, y) {
  return objects.content.find((obj) => obj.pos.x === x && obj.pos.y === y);
}

export function removeObject() {
  if (zoom !== 1) return;
  if (!canReach) return;
  const x = Math.round(cursor.x - origin.x);
  const y = Math.round(cursor.y - origin.y);

  const id = getObject(x, y)?.id;
  if (id) {
    objects.content = objects.content.filter((obj) => obj.id !== id);
  }
}

export function addObject() {
  if (zoom !== 1) return;
  if (!canReach) return;

  const x = Math.round(cursor.x - origin.x);
  const y = Math.round(cursor.y - origin.y);
  const tryId = getObject(x, y);

  if (!tryId) {
    objects.content.push(
      new Object({
        x,
        y,
        w: 50,
        h: 50,
        image: grassImage,
      })
    );
  }
}

export function update() {}

export function leftClick() {
  removeObject();
}

export function rightClick() {
  addObject();
}

export function holdMouseAction() {
  const currentCursorX = Math.round(cursor.x - velocity.x);
  const currentCursorY = Math.round(cursor.y - velocity.y);
  if (currentCursorX === prevCursorPos.x && currentCursorY === prevCursorPos.y)
    return;

  prevCursorPos.x = currentCursorX;
  prevCursorPos.y = currentCursorY;

  if (keyPressed["mouseLeft"] && canReach) {
    removeObject();
  }
  if (keyPressed["mouseRight"] && canReach) {
    addObject();
  }
}
