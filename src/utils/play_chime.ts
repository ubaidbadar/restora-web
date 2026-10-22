/** Two short rising notes, so staff hear a guest's order or call over a busy floor. Silent where audio is not allowed yet. */
export default function playChime() {
  const audio = new AudioContext();
  [660, 880].forEach((frequency, index) => {
    const tone = audio.createOscillator();
    const volume = audio.createGain();
    const start = audio.currentTime + index * 0.16;
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
    tone.connect(volume).connect(audio.destination);
    tone.start(start);
    tone.stop(start + 0.32);
  });
  window.setTimeout(() => void audio.close(), 800);
}
