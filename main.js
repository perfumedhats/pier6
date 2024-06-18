// TODO
// - Add a note about the various historical inaccuracies, such as not using railway morse or a sounder

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

document.addEventListener("DOMContentLoaded", function () {
  initializeState();
  if (isMobile()) {
    document.getElementById("msg").innerText =
      "Dear User," +
      "\n\n    Alas! Mobile devices are not yet supported. " +
      "Oh, fie! A pox on us. Would that they were! " +
      "Please betake yourself licketty-splicketty to a desktop " +
      "so as to not deprive yourself of such a singular experience as this. " +
      "\n\nSincerely," +
      "\nYour contrite servant";
    state.disabled = true;
  } else {
    document.getElementById("msg").innerText =
      "The SS Mont-Blanc is about to explode! Use your telegraph (space bar) " +
      "to warn Rockingham Station and stop the train!";
  }
});

const RESPONSE_DELAY = 3_000; // milliseconds
const TIME_UNTIL_EXPLOSION = 120_000; // milliseconds

const VIEWS = {
  UP: "up.png",
  DOWN: "down.png",
  EXPLOSION: "explosion.png",
  AFTERMATH: "aftermath.png",
};

var state = {};

function initializeState() {
  clearTimeout(state.explosionTimeout);
  clearTimeout(state.startReplyTimeout);
  clearTimeout(state.replyTimeout);

  state = {
    // Used to disable the game when running on a mobile device, as it's too buggy
    disabled: false,

    lastKeyEvent: null,

    // In listening mode (when an NPC is replying), the user cannot send messages
    listening: false,

    // The delay between user inputs that triggers a reply
    startReplyTimeout: null,

    // The timeout used while an NPC is replying
    replyTimeout: null,

    // The main image
    view: VIEWS.UP,

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

  updateView();
  resetMsg();
}

function updateView(view) {
  if (view) {
    state.view = view;
  }
  mainImage.src = state.view;
}

function resetMsg() {
  state.msg = {
    lineText: "",
    keyEvents: [],
  };
  msg.innerText = "";
}

function togglePractice(e) {
  if (state.disabled) return;

  stopBeep();

  state.practice = !state.practice;

  if (state.practice) {
    initializeState();
    // This would have been cleared when the state was reset
    state.practice = true;
  } else {
    startExplosionTimeout();
  }

  document.getElementById("clearButton").style.visibility = state.practice
    ? ""
    : "hidden";

  document.getElementById("practiceButton").innerText =
    "Practice Mode " + (state.practice ? "ON" : "OFF");
}

function clearMsg(e) {
  e.preventDefault();
  e.stopPropagation();
  resetMsg();
}

function explode() {
  if (state.exploded) return;

  stopBeep();
  clearTimeout(state.replyTimeout);
  clearTimeout(state.startReplyTimeout);

  state.exploded = true;
  msg.innerText = "";
  document.getElementById("explosionAudio").play();
  updateView(VIEWS.EXPLOSION);
  state.replyTimeout = setTimeout(function () {
    updateView(VIEWS.AFTERMATH);
    state.replyTimeout = setTimeout(function () {
      state.narration = true;
      playMsg(
        "The last words of Vincent Coleman, on Dec 6, 1917",
        "Hold up the train. " +
          "Ammunition ship afire in harbour making for Pier 6 and will explode. " +
          "Guess this will be my last message. Good-bye, boys."
      );
    }, 2000);
  }, 6000);
}

function startExplosionTimeout() {
  if (!state.practice) {
    state.explosionTimeout = setTimeout(explode, TIME_UNTIL_EXPLOSION);
  }
}

function press() {
  if (state.disabled || state.listening || state.exploded) return;

  if (!state.started) {
    startExplosionTimeout();
    state.started = true;
  }

  updateView(VIEWS.DOWN);
  clearTimeout(state.startReplyTimeout);

  state.msg.keyEvents.push({
    down: false,
    duration: Date.now() - state.lastKeyEvent,
  });
  state.lastKeyEvent = Date.now();

  startBeep();
}

function release() {
  if (state.disabled || state.listening || state.exploded) return;

  updateView(VIEWS.UP);

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
  if (event.repeat) return;
  if (event.code === "Space") press();
  if (event.code === "Backspace" && state.practice) clearMsg(event);
});

document.addEventListener("keyup", function (event) {
  if (event.code === "Space") release();
});

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("mousedown", function (event) {
    if (!event.target.classList.contains("sidebarButton")) press();
  });
  document.body.addEventListener("mouseup", function (event) {
    if (!event.target.classList.contains("sidebarButton")) release();
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
      "CFM PSE? QRS? K", // Confirm please, "Send more slowly"
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
