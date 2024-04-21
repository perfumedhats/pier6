function invertObject(obj) {
  const inverted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      inverted[obj[key]] = key;
    }
  }
  return inverted;
}

encode = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  0: ".----",
  1: "..---",
  2: "...--",
  3: "....-",
  4: ".....",
  5: "-....",
  6: "--...",
  7: "---..",
  8: "----.",
  9: "-----",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "⌫": "........",
  " ": " ",
  "/": "/",
};

const dit = 60;
const timing = {
  ".": dit,
  "-": dit * 3,
  " ": dit * 3,
  "/": dit * 7,
};

decode = invertObject(encode);

function toEnglish(callsign, message) {
  return (
    callsign +
    ": " +
    message
      .split("/")
      .map(function (word) {
        return word
          .split(" ")
          .map((x) => (decode[x] === undefined ? x : decode[x]))
          .join("");
      })
      .join(" ")
      .toUpperCase()
  );
}

const average = (array) =>
  array.length ? array.reduce((a, b) => a + b) / array.length : null;

translate = function (keyEvents) {
  // Everything below the mean is a dot, everything above the mean is a dash.
  // This assumes a roughly equal distribution of dots and dashes, and should be replaced with
  // a better method of 1d clustering.
  mean = average(keyEvents.filter((x) => x.down).map((x) => x.duration));
  dotLength = average(
    keyEvents.filter((x) => x.down && x.duration < mean).map((x) => x.duration)
  );
  dashLength = average(
    keyEvents.filter((x) => x.down && x.duration > mean).map((x) => x.duration)
  );

  if (dotLength === null || dashLength === null) "";

  // In the event that there are far more dots than dashes, the dashLength could be based on dots, not dashes,
  // so overwrite it
  if (dashLength < 2 * dotLength) {
    dotLength = 60;
    dashLength = 3 * dotLength;
  }

  // The space between a word should be 7 dashes, or 3 dots.
  // Average these two for a better approximation.
  longPauseLength = average([dotLength * 7, dashLength * (7 / 3)]);
  pauseDemarcation = average([dotLength, longPauseLength]);

  // The space between letters

  text = keyEvents
    .map(function (x) {
      if (x.down) {
        return x.duration < mean ? "." : "-";
      } else {
        return x.duration < mean
          ? ""
          : x.duration < longPauseLength
          ? " "
          : "/";
      }
    })
    .join("");

  return toEnglish("Coleman", text);
};
