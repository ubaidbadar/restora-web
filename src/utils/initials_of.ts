/** "Test Customer" gives "TC"; a single word gives its first two letters. Works for any script. */
export default function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[1]].map((word) => [...(word ?? '')][0] ?? '') : [...(words[0] ?? '')].slice(0, 2);
  return letters.join('').toUpperCase();
}
