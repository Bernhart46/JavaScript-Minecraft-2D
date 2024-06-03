import { Object, objects } from "../object.js";

//Block Images
const grassImage = document.getElementById("grassImage");

export function getObject(x, y) {
  return objects.content.find((obj) => obj.pos.x === x && obj.pos.y === y);
}

export function removeObject(id) {
  objects.content = objects.content.filter((obj) => obj.id !== id);
}

export function addObject(x, y) {
  const tryId = getObject(x, y);

  if (!tryId) {
    objects.content.push(
      new Object({
        x,
        y,
        w: 50,
        h: 50,
        color: "aqua",
        image: grassImage,
      })
    );
  } else {
    console.log("ERROR: There is already an object there.");
  }
}
