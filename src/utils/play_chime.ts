/** The page's one sound output. Browsers keep it muted until someone has used the page since it loaded. */
let audio: AudioContext | undefined;

const unmute = () => {
  audio ??= new AudioContext();
  void audio.resume();
  return audio;
};

// After a reload nobody has touched the page yet: the first tap or key press anywhere turns the sound on.
window.addEventListener('pointerdown', unmute, { once: true, capture: true });
window.addEventListener('keydown', unmute, { once: true, capture: true });

/** Two short rising notes, so staff hear a guest's order or call over a busy floor. */
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
}
