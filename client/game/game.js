import {
  objO as objects,
  socket,
  origin,
  cursor,
  zoom,
  keyPressed,
  velocity,
  canReach,
  blockType,
} from "../script.js";

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
    socket.emit("remove_block_to_server", id);
  }
}

export function addObject() {
  if (zoom !== 1) return;
  if (!canReach) return;

  const x = Math.round(cursor.x - origin.x);
  const y = Math.round(cursor.y - origin.y);
  const tryId = getObject(x, y);

  if (!tryId) {
    socket.emit("place_block_to_server", {
      x,
      y,
      w: 50,
      h: 50,
      type: blockType,
    });
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
