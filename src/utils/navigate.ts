/** Full-page navigation. Kept behind a helper so tests can stub it: jsdom
 *  defines window.location.assign as non-configurable, so it cannot be mocked
 *  directly. */
export default function navigate(url: string): void {
  window.location.assign(url);
}
