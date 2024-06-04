import { ctx, messages, message, id } from "../script.js";

export let isInputOn = false;

let caretOn = true;
export let isTypingOn = false;
export function drawChat() {
  ctx.font = "14px Courier";
  ctx.fillStyle = "rgb(125,125,125,0.5)";
  ctx.fillRect(0, window.innerHeight - 300, 400, 300);

  ctx.fillStyle = "black";
  let n = 1;
  for (let i = messages.length; i > messages.length - 12; i--) {
    const isMessage = messages[i]?.message !== undefined;
    ctx.fillStyle =
      messages[i]?.id === id ? "red" : isMessage ? "blue" : "black";
    ctx.fillRect(5, window.innerHeight - 24 * n, 10, 10);
    ctx.fillStyle = "black";
    ctx.fillText(
      `${messages[i]?.message || ""}`,
      20,
      window.innerHeight + 10 - 24 * n
    );
    n++;
  }

  //Input
  if (!isTypingOn) {
    ctx.fillStyle = "rgb(200,200,200, 0.9)";
  } else {
    ctx.fillStyle = "white";
  }
  ctx.fillRect(0, window.innerHeight - 30, 400, 30);

  //Message
  ctx.fillStyle = "black";
  ctx.fillText(message, 10, window.innerHeight - 10);
  //Caret
  ctx.fillStyle = "black";
  if (caretOn && isTypingOn) {
    ctx.fillRect(8 + message.length * 8.5, window.innerHeight - 26, 4, 22);
  }
  if (!isTypingOn) {
    ctx.fillText(
      'Press "T" to chat. Max message length: 40 char.',
      6,
      window.innerHeight - 10
    );
  }
}

export function changeTypingOn() {
  isTypingOn = !isTypingOn;
}

setInterval(() => {
  caretOn = !caretOn;
}, 750);
