var practiceMode = false;
var lineText = "";

keyEvents = [];
var upTime, downTime;

var over,
  listening = false,
  first = true,
  exploded = false;

function explosion() {
  exploded = true;
  msg.innerText = "";
  document.getElementById("explosionAudio").play();
  view.src = "explosion2.png";
  setTimeout(function () {
    view.src = "aftermath.png";
    setTimeout(function () {
      text =
        "Hold up the train. " +
        "Ammunition ship afire in harbour making for Pier 6 and will explode. " +
        "Guess this will be my last message. Good-bye, boys.";
      playMsg("Coleman", proseToMorse(text), 0, false, true);
    }, 2000);
  }, 6000);
}

function press() {
  if (listening || exploded) return;

  if (first) {
    setTimeout(explosion, 120_000);
    first = false;
  }

  view.src = "down.png";
  clearTimeout(over);

  downTime = Date.now();
  keyEvents.push({ down: false, duration: Date.now() - upTime });

  startBeep();
}

function release() {
  if (listening || exploded) return;

  view.src = "up.png";

  upTime = Date.now();
  keyEvents.push({ down: true, duration: Date.now() - downTime });

  stopBeep();
  if (!practiceMode) {
    over = setTimeout(generateReply, 3000);
  }

  msg.innerText = translate(keyEvents.slice(1));
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") press();
});

document.addEventListener("keyup", function (event) {
  if (event.code === "Space") release();
});

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("mousedown", function (event) {
    event.preventDefault();
    press();
  });
  document.body.addEventListener("mouseup", function (event) {
    event.preventDefault();
    release();
  });
});

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

sent = {
  fire: false,
  ship: false,
  stop: false,
  train: false,
};

function generateReply() {
  normalized = msg.innerText.replace(/ /g, "");
  sent.fire =
    sent.fire || /FIRE|SMOKE|EXPLOSION|FLAME|BLAZE|DANGER/.test(normalized);
  sent.ship = sent.ship || /BOAT|SHIP|VESSEL|BARGE/.test(normalized);
  sent.stop =
    sent.stop || /STOP|DELAY|PREVENT|ARREST|BLOCK|PREVENT/.test(normalized);
  sent.train =
    sent.train || /TRAIN|LOCOMOTIVE|ENGINE|DEPARTURE/.test(normalized);

  listening = true;
  lineText = "";
  keyEvents = [];

  if (sent.fire && sent.ship && sent.stop && sent.train) {
    text = "ACK. TRAIN STOPPED. YOU WIN THE GAME";
  } else if (sent.stop && !sent.train) {
    text = "STOP WHAT?";
  } else if (sent.stop && sent.train && !sent.fire) {
    text = "WHY STOP THE TRAIN?";
  } else if (sent.fire && !sent.ship) {
    text = "WHAT IS ON FIRE?";
  } else if (sent.ship && !sent.fire) {
    text = "WHAT ABOUT THIS SHIP?";
  } else if (sent.ship && sent.fire) {
    text = "PSE ADVISE ON ACTION";
  } else {
    text = getRandomElement([
      "GM HLFX, QRM? K",
      "CFM PSE? QRS? K", // Confirm please, callsign?
      "QRU QRU DE CGRD K", // "QRU" means "I have nothing for you; do you have anything for me?" repeated for emphasis, followed by "DE CGRD" indicating "from the hypothetical call sign for the CGR depot
      "QRM PSE AGN K", // "QRM" indicates that there is interference ("Please repeat your message"), "PSE" (please), "AGN" (again), and "K" to end the request
      "QRP? DE CGRD K", // "QRP" asks "Should I decrease transmitter power?" and "DE GD" indicates the station's identifier,
      "QRS PSE K", // "QRS" means "Send more slowly", followed by "PSE" for please
    ]);
  }

  playMsg("Dustan", proseToMorse(text), 0, false, false);
}

function proseToMorse(text) {
  return [...text.toLowerCase().replace(/ /g, "/")]
    .map((x) => encode[x])
    .join(" ");
}

function playMsg(callsign, code, i, shortPause, override) {
  char = code[i];
  nextChar = code[i + 1];

  stopBeep();

  if (exploded && !override) return;

  if (i >= code.length) {
    listening = false;
    msg.innerText = toEnglish(callsign, lineText);
    return;
  }

  jitter = Math.random(10) - 5;

  if (shortPause) {
    setTimeout(
      playMsg.bind(this, callsign, code, i, false, override),
      timing["⋅"] + jitter
    );
  } else if (char === "⋅" || char === "-") {
    lineText += char;
    startBeep();
    shortPause = nextChar === "⋅" || nextChar === "-";
    setTimeout(
      playMsg.bind(this, callsign, code, i + 1, shortPause, override),
      timing[char] + jitter
    );
  } else {
    lineText += char;
    msg.innerText = toEnglish(callsign, lineText);
    setTimeout(
      playMsg.bind(this, callsign, code, i + 1, false, override),
      timing[char] + jitter
    );
  }
}
