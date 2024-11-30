// Look out hackers, I know M A C H I N E L E A R N I N G
// This algortihm uses <fumbles sunglasses> AI, that means artificial intelligence.
// You know, from e = mc^2 + ai?
// First I exterpolate the clustroids to find null values. Then I apply SQL99 + Win98 to unlock the Bernoulli values

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
  a: "⋅-",
  b: "-⋅⋅⋅",
  c: "-⋅-⋅",
  d: "-⋅⋅",
  e: "⋅",
  f: "⋅⋅-⋅",
  g: "--⋅",
  h: "⋅⋅⋅⋅",
  i: "⋅⋅",
  j: "⋅---",
  k: "-⋅-",
  l: "⋅-⋅⋅",
  m: "--",
  n: "-⋅",
  o: "---",
  p: "⋅--⋅",
  q: "--⋅-",
  r: "⋅-⋅",
  s: "⋅⋅⋅",
  t: "-",
  u: "⋅⋅-",
  v: "⋅⋅⋅-",
  w: "⋅--",
  x: "-⋅⋅-",
  y: "-⋅--",
  z: "--⋅⋅",
  0: "⋅----",
  1: "⋅⋅---",
  2: "⋅⋅⋅--",
  3: "⋅⋅⋅⋅-",
  4: "⋅⋅⋅⋅⋅",
  5: "-⋅⋅⋅⋅",
  6: "--⋅⋅⋅",
  7: "---⋅⋅",
  8: "----⋅",
  9: "-----",
  ".": "⋅-⋅-⋅-",
  "-": "-⋅⋅⋅⋅-",
  ",": "--⋅⋅--",
  "?": "⋅⋅--⋅⋅",
  "'": "⋅----⋅",
  "⌫": "⋅⋅⋅⋅⋅⋅⋅⋅",
  " ": " ",
  "/": "/",
};

const dit = 60;
const timing = {
  "⋅": dit,
  "-": dit * 3,
  " ": dit * 3,
  "/": dit * 7,
};

decode = invertObject(encode);

function toEnglish(callsign, message) {
  // Prevent rendering the in-progress character.
  // The message can have a ' ' appended to prevent this.
  message = message.replace(/[.-]+$/, "");

  return (
    callsign +
    ": " +
    message
      .split("/")
      .map((word) =>
        word
          .split(" ")
          .map((x) => (decode[x] === undefined ? x : decode[x]))
          .join("")
      )
      .join(" ")
      .toUpperCase()
  );
}

const average = (array) =>
  array.length ? array.reduce((a, b) => a + b) / array.length : null;

function median(array) {
  array = array.sort((a, b) => a - b);

  const midpoint = Math.floor(array.length / 2);

  return array.length % 2
    ? array[midpoint]
    : (array[midpoint - 1] + array[midpoint]) / 2;
}

function kmeans(array) {
  var cluster0 = [];
  var cluster1 = [];
  var centroid0 = Math.min(...array);
  var centroid1 = Math.max(...array);

  for (iterations = 0; iterations < 5; iterations++) {
    for (i = 0; i < array.length; i++) {
      x = array[i];
      if (Math.abs(x - centroid0) < Math.abs(x - centroid1)) {
        cluster0.push(x);
      } else {
        cluster1.push(x);
      }
    }
    centroid0 = average(cluster0);
    centroid1 = average(cluster1);
  }

  return [centroid0, centroid1];
}

translate = function (keyEvents) {
  var [dotLength, dashLength] = kmeans(
    keyEvents.filter((x) => x.down).map((x) => x.duration)
  );

  if (dotLength === null && dashLength === null) return "";
  if (dotLength === null) {
    dotLength = dashLength / 3;
  }
  if (dashLength === null) {
    dashLength = dotLength * 3;
  }
  if (dashLength < dotLength * 2) {
    dashLength = dotLength * 3;
  }

  // The space between a word should be 7 dashes, or 3 dots.
  // Average these two for a better approximation.
  longPauseLength = average([dotLength * 7, dashLength * (7 / 3)]);
  pauseDemarcation = average([dotLength, longPauseLength]);

  text = keyEvents
    .map(function (x) {
      var isDit =
        Math.abs(dotLength - x.duration) < Math.abs(dashLength - x.duration);
      if (x.down) {
        return isDit ? "⋅" : "-";
      } else {
        return isDit ? "" : x.duration < longPauseLength ? " " : "/";
      }
    })
    .join("");

  // Add a space so in-progress characters will be rendered
  text += " ";

  return toEnglish("Coleman", text);
};
