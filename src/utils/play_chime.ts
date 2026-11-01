/** The page's one sound output. Browsers keep it muted until someone has used the page since it loaded. */
let audio: AudioContext | undefined;
let unlocked = false;

const unmute = () => {
  audio ??= new AudioContext();
  void audio.resume();
  return audio;
};

// After a reload nobody has touched the page yet: the first tap or key press anywhere turns the sound on.
const unlock = () => {
  unlocked = true;
  unmute();
};
window.addEventListener('pointerdown', unlock, { once: true, capture: true });
window.addEventListener('keydown', unlock, { once: true, capture: true });

/**
 * Two short rising notes, so staff hear a new order or a guest's call over a busy floor. Answers false when the browser
 * still holds the sound back (nobody has tapped the page since it loaded), so the caller can ask for a tap.
 */
export default function playChime() {
  const context = unmute();
  [660, 880].forEach((frequency, index) => {
    const tone = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime + index * 0.16;
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
    tone.connect(volume).connect(context.destination);
    tone.start(start);
    tone.stop(start + 0.32);
  });
  return unlocked || context.state === 'running';
}
