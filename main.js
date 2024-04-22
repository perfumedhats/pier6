let PRACTICE_MODE = false;
const RESPONSE_DELAY = 3_000;
var lineText = "";

keyEvents = [];
var upTime, downTime;

var over,
  listening = false,
  first = true;

var state = {
  started: false,
  practice: false,
  stoppedTrain: false,
  exploded: false,
  narration: false,
};

function explode() {
  if (state.exploded) return;

  state.exploded = true;
  msg.innerText = "";
  document.getElementById("explosionAudio").play();
  view.src = "explosion.png";
  setTimeout(function () {
    view.src = "aftermath.png";
    setTimeout(function () {
      text =
        "Hold up the train. " +
        "Ammunition ship afire in harbour making for Pier 6 and will explode. " +
        "Guess this will be my last message. Good-bye, boys.";
      state.narration = true;
      playMsg("The last words of Vincent Coleman, on Dec 6, 1917", text);
    }, 2000);
  }, 6000);
}

function press() {
  if (listening || state.exploded) return;

  if (state.started) {
    setTimeout(explode, 120_000);
    state.started = true;
  }

  view.src = "down.png";
  clearTimeout(over);

  downTime = Date.now();
  keyEvents.push({ down: false, duration: Date.now() - upTime });

  startBeep();
}

function release() {
  if (listening || state.exploded) return;

  view.src = "up.png";

  upTime = Date.now();
  keyEvents.push({ down: true, duration: Date.now() - downTime });

  stopBeep();
  if (!PRACTICE_MODE) {
    over = setTimeout(generateReply, RESPONSE_DELAY);
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

  if (sent.fire && sent.ship && sent.stop && sent.train) {
    text = "ACK. TRAIN STOPPED.";
    state.stoppedTrain = true;
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

  playMsg("ROCKINGHAM", text);
}

function proseToMorse(text) {
  return [...text.toLowerCase().replace(/ /g, "/")]
    .map((x) => encode[x])
    .join(" ");
}

function playMsg(callsign, text) {
  listening = true;
  lineText = "";
  keyEvents = [];

  playMsgCallback(callsign, proseToMorse(text), 0, false);
}

function playMsgCallback(callsign, code, i, shortPause) {
  char = code[i];
  nextChar = code[i + 1];

  stopBeep();

  if (i >= code.length) {
    listening = false;
    msg.innerText = toEnglish(callsign, lineText + " ");

    if (state.stoppedTrain && !state.exploded) {
      explode();
    }
    return;
  }

  if (state.exploded && !state.narration) return;

  jitter = Math.random(10) - 5;

  if (shortPause) {
    setTimeout(
      playMsgCallback.bind(this, callsign, code, i, false),
      timing["⋅"] + jitter
    );
  } else if (char === "⋅" || char === "-") {
    lineText += char;
    startBeep();
    shortPause = nextChar === "⋅" || nextChar === "-";
    setTimeout(
      playMsgCallback.bind(this, callsign, code, i + 1, shortPause),
      timing[char] + jitter
    );
  } else {
    lineText += char;
    msg.innerText = toEnglish(callsign, lineText);
    setTimeout(
      playMsgCallback.bind(this, callsign, code, i + 1, false),
      timing[char] + jitter
    );
  }
}
