var lineText = "";

keyEvents = [];

var upTime, downTime;

var over,
  listening = false;

document.addEventListener("keydown", function (event) {
  if (listening || event.code !== "Space") return;
  imgUp.style.display = "none";
  imgDown.style.display = "";
  clearTimeout(over);

  downTime = Date.now();
  keyEvents.push({ down: false, duration: Date.now() - upTime });

  startBeep();
});

document.addEventListener("keyup", function (event) {
  if (listening || event.code !== "Space") return;
  imgUp.style.display = "";
  imgDown.style.display = "none";

  upTime = Date.now();
  keyEvents.push({ down: true, duration: Date.now() - downTime });

  stopBeep();
  // over = setTimeout(generateReply, 3000);

  msg.innerText = translate(keyEvents.slice(1));
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
  sent.fire =
    sent.fire ||
    /FIRE|SMOKE|EXPLOSION|FLAME|BLAZE|DANGER/.test(
      msg.innerText.replace(" ", "")
    );
  sent.ship =
    sent.ship || /BOAT|SHIP|VESSEL|BARGE/.test(msg.innerText.replace(" ", ""));
  sent.stop =
    sent.stop ||
    /STOP|DELAY|PREVENT|ARREST|BLOCK|PREVENT/.test(
      msg.innerText.replace(" ", "")
    );
  sent.train =
    sent.train ||
    /TRAIN|LOCOMOTIVE|ENGINE|DEPARTURE/.test(msg.innerText.replace(" ", ""));

  listening = true;
  lineText = "";
  keyEvents = [];
  if (sent.stop && !sent.train) {
    text = "STOP WHAT?";
  } else if (sent.stop && sent.train && !sent.fire) {
    text = "WHY STOP THE TRAIN?";
  } else if (sent.fire && !sent.ship) {
    text = "WHAT IS ON FIRE?";
  } else if (sent.ship && !sent.fire) {
    text = "WHAT ABOUT THIS SHIP?";
  } else if (sent.ship && sent.fire) {
    text = "PSE ADVISE ON ACTION";
  } else if (sent.fire && sent.ship && sent.stop && sent.train) {
    text = "ACK. TRAIN STOPPED. YOU WIN THE GAME";
  } else {
    text = getRandomElement([
      "GM HLFX, NIL UNDERSTOOD QRM K",
      "CFM PSE. CS? QRS? K", // Confirm please, callsign?
      "99 LID. NIL UNDERSTOOD. QSL K", // Fuck off bad operator. QSL = acknowledge receipt
      "QRU QRU DE CGRD K", // "QRU" means "I have nothing for you; do you have anything for me?" repeated for emphasis, followed by "DE CGRD" indicating "from the hypothetical call sign for the CGR depot
      "QRM PSE AGN K", // "QRM" indicates that there is interference ("Please repeat your message"), "PSE" (please), "AGN" (again), and "K" to end the request
      "QRP? DE CGRD K", // "QRP" asks "Should I decrease transmitter power?" and "DE GD" indicates the station's identifier,
      "QRS PSE K", // "QRS" means "Send more slowly", followed by "PSE" for please
    ]);
  }
  code = [...text.toLowerCase().replace(/ /g, "/")]
    .map((x) => encode[x])
    .join(" ");

  playMsg(code, 0, false);
}

function playMsg(code, i, shortPause) {
  char = code[i];
  nextChar = code[i + 1];

  stopBeep();

  if (i >= code.length) {
    listening = false;
    msg.innerText = toEnglish("Dustan", lineText);
    return;
  }

  jitter = Math.random(10) - 5;

  if (shortPause) {
    setTimeout(playMsg.bind(this, code, i, false), timing["."] + jitter);
  } else if (char === "." || char === "-") {
    lineText += char;
    startBeep();
    shortPause = nextChar === "." || nextChar === "-";
    setTimeout(
      playMsg.bind(this, code, i + 1, shortPause),
      timing[char] + jitter
    );
  } else {
    lineText += char;
    msg.innerText = toEnglish("Dustan", lineText);
    setTimeout(playMsg.bind(this, code, i + 1, false), timing[char] + jitter);
  }
}
