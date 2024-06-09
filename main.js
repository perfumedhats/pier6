// TODO
// - Practice mode doesn't work after the explosion

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
// associated documentation files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge, publish, distribute,
// sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or
// substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
// AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const RESPONSE_DELAY = 3_000; // milliseconds
const TIME_UNTIL_EXPLOSION = 120_000; // milliseconds

var state = {
  lastKeyEvent: null,

  // In listening mode (when an NPC is replying), the user cannot send messages
  listening: false,

  // The delay between user inputs that triggers a reply
  startReplyTimeout: null,

  // The timeout used while an NPC is replying
  replyTimeout: null,

  explosionTimeout: null,
  started: false,
  practice: false,
  stoppedTrain: false,
  exploded: false,
  narration: false,

  // The current state of the user's reply
  msg: {
    lineText: "",
    keyEvents: [],
  },

  // The current state of what the user has told Rockingham
  sent: {
    fire: false,
    ship: false,
    stop: false,
    train: false,
  },
};

function resetMsg() {
  state.msg = {
    lineText: "",
    keyEvents: [],
  };
  msg.innerText = "";
}

function togglePractice(e) {
  e.preventDefault();
  e.stopPropagation();

  stopBeep();
  state.listening = false;

  state.practice = !state.practice;
  document.getElementById("clearButton").style.visibility = state.practice
    ? ""
    : "hidden";
  document.getElementById("practiceButton").innerText =
    "Practice Mode " + (state.practice ? "ON" : "OFF");

  if (state.practice) {
    clearTimeout(state.explosionTimeout);
    clearTimeout(state.startReplyTimeout);
    clearTimeout(state.replyTimeout);
  } else {
    startExplosionTimeout();
  }
}

function clearMsg(e) {
  e.preventDefault();
  e.stopPropagation();
  resetMsg();
}

function explode() {
  if (state.exploded) return;

  stopBeep();

  state.exploded = true;
  msg.innerText = "";
  document.getElementById("explosionAudio").play();
  view.src = "explosion.png";
  state.replyTimeout = setTimeout(function () {
    // Show the ruins of Halifax
    view.src = "aftermath.png";
    state.replyTimeout = setTimeout(function () {
      // Play Vincent's message
      text =
        "Hold up the train. " +
        "Ammunition ship afire in harbour making for Pier 6 and will explode. " +
        "Guess this will be my last message. Good-bye, boys.";
      state.narration = true;
      playMsg("The last words of Vincent Coleman, on Dec 6, 1917", text);
    }, 2000);
  }, 6000);
}

function startExplosionTimeout() {
  state.explosionTimeout = setTimeout(explode, TIME_UNTIL_EXPLOSION);
}

function press() {
  if (state.listening || state.exploded) return;

  if (!state.started) {
    startExplosionTimeout();
    state.started = true;
  }

  view.src = "down.png";
  clearTimeout(state.startReplyTimeout);

  state.msg.keyEvents.push({
    down: false,
    duration: Date.now() - state.lastKeyEvent,
  });
  state.lastKeyEvent = Date.now();

  startBeep();
}

function release() {
  if (state.listening || state.exploded) return;

  view.src = "up.png";

  state.msg.keyEvents.push({
    down: true,
    duration: Date.now() - state.lastKeyEvent,
  });
  state.lastKeyEvent = Date.now();

  stopBeep();
  if (!state.practice) {
    state.startReplyTimeout = setTimeout(generateReply, RESPONSE_DELAY);
  }

  msg.innerText = translate(state.msg.keyEvents.slice(1));
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") press();
});

document.addEventListener("keyup", function (event) {
  if (event.code === "Space") release();
});

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("touchstart", function (e) {
    console.log("start");
    e.preventDefault();
    e.stopPropagation();
    press();
  });
  document.body.addEventListener("touchend", function (e) {
    console.log("stop");
    e.preventDefault();
    e.stopPropagation();
    release();
  });
});

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function generateReply() {
  var sent = state.sent;
  normalized = msg.innerText.replace(/ /g, "");
  sent.fire =
    sent.fire || /FIRE|SMOKE|EXPLOSION|FLAME|BLAZE|DANGER/.test(normalized);
  sent.ship = sent.ship || /BOAT|SHIP|VESSEL|BARGE/.test(normalized);
  sent.stop =
    sent.stop ||
    /STOP|DELAY|PREVENT|ARREST|BLOCK|PREVENT|HOLD/.test(normalized);
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
  state.listening = true;
  resetMsg();
  msg.innerText = callsign + ": ";
  playMsgCallback(callsign, proseToMorse(text), 0, false);
}

function playMsgCallback(callsign, code, i, shortPause) {
  var char = code[i];
  var nextChar = code[i + 1];

  stopBeep();

  if (i >= code.length) {
    state.listening = false;
    msg.innerText = toEnglish(callsign, state.msg.lineText + " ");

    if (state.stoppedTrain && !state.exploded) {
      explode();
    }
    return;
  }

  if (state.exploded && !state.narration) return;

  jitter = Math.random(10) - 5;

  if (shortPause) {
    state.replyTimeout = setTimeout(
      playMsgCallback.bind(this, callsign, code, i, false),
      timing["⋅"] + jitter
    );
  } else if (char === "⋅" || char === "-") {
    state.msg.lineText += char;
    startBeep();
    shortPause = nextChar === "⋅" || nextChar === "-";
    state.replyTimeout = setTimeout(
      playMsgCallback.bind(this, callsign, code, i + 1, shortPause),
      timing[char] + jitter
    );
  } else {
    state.msg.lineText += char;
    msg.innerText = toEnglish(callsign, state.msg.lineText);
    state.replyTimeout = setTimeout(
      playMsgCallback.bind(this, callsign, code, i + 1, false),
      timing[char] + jitter
    );
  }
}
