// Create an instance of AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = null;

// Function to start the beep
function startBeep() {
  if (oscillator) {
    stopBeep();
  }

  // Create an oscillator
  oscillator = audioContext.createOscillator();
  oscillator.type = "sine"; // You can change this to 'square', 'sawtooth', or 'triangle'
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hertz (A4 note)

  // Connect the oscillator to the audio context's destination
  oscillator.connect(audioContext.destination);
  oscillator.start();
}

function stopBeep() {
  if (oscillator) {
    oscillator.stop(); // Stop the beep
    oscillator.disconnect(); // Disconnect it from the destination
    oscillator = null; // Reset the oscillator variable
  }
}
