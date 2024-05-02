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
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hertz (A4 note)

  // Create a GainNode
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Set initial gain (50% volume)

  // Connect the oscillator to the gain node and the gain node to the destination
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

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
