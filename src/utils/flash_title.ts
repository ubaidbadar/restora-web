let count = 0;
let title = '';
let timer = 0;

const restore = () => {
  if (document.hidden) return;
  window.clearInterval(timer);
  document.title = title;
  count = 0;
  document.removeEventListener('visibilitychange', restore);
};

/**
 * While the tab is in the background, its title blinks "(2) New orders" until someone comes back to it, so a new
 * order is seen from another tab or app too.
 */
export default function flashTitle() {
  if (!document.hidden) return;
  if (!count) {
    title = document.title;
    document.addEventListener('visibilitychange', restore);
  }
  count += 1;
  const label = `(${count}) New order${count === 1 ? '' : 's'}`;
  window.clearInterval(timer);
  document.title = label;
  timer = window.setInterval(() => (document.title = document.title === label ? title : label), 1_000);
}
