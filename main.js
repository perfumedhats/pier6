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

document.addEventListener("DOMContentLoaded", function () {
  let isMobile = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      isMobile = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  if (isMobile) {
    document.getElementById("msg").innerText =
      "Dear User,\n\n    Alas! Mobile devices are not yet supported. Oh, fie! A pox on us. Would that they were! Please betake yourself licketty-splicketty to a desktop so as to not deprive yourself of such a singular experience as this. \n\nSincerely,\nYour contrite servant";
    state.disabled = true;
  }
});

const RESPONSE_DELAY = 3_000; // milliseconds
const TIME_UNTIL_EXPLOSION = 120_000; // milliseconds

var state = {
  // Used to disable the game when running on a mobile device, as it's too buggy
  disabled: false,

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

  if (state.disabled) {
    return;
  }

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
  if (state.disabled || state.listening || state.exploded) return;

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
  if (state.disabled || state.listening || state.exploded) return;

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
    e.preventDefault();
    e.stopPropagation();
    press();
  });
  document.body.addEventListener("touchend", function (e) {
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
