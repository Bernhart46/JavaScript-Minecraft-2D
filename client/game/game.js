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
  //'real' because it's not devided by 50 but it's the original
  const real_x = Math.round(cursor.x - origin.x);
  const real_y = Math.round(cursor.y - origin.y);
  //return if below bedrock
  if (real_y > 0) return;

  const chunk = Math.floor(real_x / 50 / 16);
  const block_x = (real_x - chunk * 50 * 16) / 50;
  const block_y = Math.abs(real_y / 50);

  const removeableBlock = {
    isNegative: chunk < 0,
    chunk: Math.abs(chunk),
    x: block_x,
    y: block_y,
  };
  socket.emit("remove_block_to_server", removeableBlock);
}

export function addObject() {
  if (zoom !== 1) return;
  if (!canReach) return;

  const real_x = Math.round(cursor.x - origin.x);
  const real_y = Math.round(cursor.y - origin.y);
  //return if below bedrock
  if (real_y > 0) return;

  const chunk = Math.floor(real_x / 50 / 16);
  const block_x = (real_x - chunk * 50 * 16) / 50;
  const block_y = Math.abs(real_y / 50);

  const placeableBlock = {
    isNegative: chunk < 0,
    chunk: Math.abs(chunk),
    x: block_x,
    y: block_y,
    type: blockType,
  };

  socket.emit("place_block_to_server", placeableBlock);
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
