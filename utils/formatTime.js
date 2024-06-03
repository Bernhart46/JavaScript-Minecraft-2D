export function formatTime(totalSeconds) {
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;

  return (
    padZero(hours) + ":" + padZero(minutes) + ":" + padZero(seconds.toFixed(0))
  );
}

function padZero(num) {
  return (num < 10 ? "0" : "") + num;
}
