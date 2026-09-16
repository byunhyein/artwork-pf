const folders = document.querySelectorAll('.folder');
const liveClock = document.querySelector('.live-clock');
const dockItems = document.querySelectorAll('.dock-item');
const artworkDock = document.querySelector('.artwork-dock');
const dockActiveIndicator = document.querySelector('.dock-active-indicator');
const artworkCategories = ['person', 'character', 'drawing', 'object'];

folders.forEach((folder) => {
  folder.addEventListener('click', (event) => {
    const target = folder.getAttribute('href');
    if (target?.startsWith('#')) event.preventDefault();
  });
});

function updateClock() {
  if (!liveClock) return;

  const now = new Date();
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  liveClock.dateTime = now.toISOString();
  liveClock.textContent = `${date}  ${time}`;
  liveClock.setAttribute('aria-label', `현재 시간 ${date}, ${time}`);
}

updateClock();
window.setInterval(updateClock, 60_000);

function updateDockActiveState() {
  const currentTarget = window.location.hash.slice(1) || 'archive';
  dockItems.forEach((item) => {
    const isActive = item.dataset.dockTarget === currentTarget;
    item.classList.toggle('is-active', isActive);
    item.toggleAttribute('aria-current', isActive);
  });

  const activeItem = [...dockItems].find((item) => item.dataset.dockTarget === currentTarget);
  if (!activeItem || !artworkDock || !dockActiveIndicator) return;

  const dockBounds = artworkDock.getBoundingClientRect();
  const itemBounds = activeItem.getBoundingClientRect();
  dockActiveIndicator.style.left = `${itemBounds.left - dockBounds.left + itemBounds.width / 2}px`;
  dockActiveIndicator.classList.add('is-ready');
}

dockItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    if (item.dataset.dockTarget !== 'random') return;

    event.preventDefault();
    const randomCategory = artworkCategories[Math.floor(Math.random() * artworkCategories.length)];
    window.location.hash = randomCategory;
  });
});

updateDockActiveState();
window.addEventListener('hashchange', updateDockActiveState);
window.addEventListener('resize', updateDockActiveState);

const sparkleColors = ['#eb6f9b', '#e9b84d', '#5d9eea', '#72ad70'];
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let lastSparkleTime = 0;
const cursorHalo = document.createElement('span');

cursorHalo.className = 'cursor-halo';
cursorHalo.setAttribute('aria-hidden', 'true');
document.body.appendChild(cursorHalo);

function createMouseSparkle(event) {
  if (reducedMotionQuery.matches || event.pointerType === 'touch') return;

  const now = performance.now();
  if (now - lastSparkleTime < 42) return;
  lastSparkleTime = now;

  const sparkle = document.createElement('span');
  const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
  const driftX = (Math.random() - 0.5) * 24;
  const driftY = 18 + Math.random() * 22;

  sparkle.className = 'mouse-sparkle';
  sparkle.style.left = `${event.clientX}px`;
  sparkle.style.top = `${event.clientY}px`;
  sparkle.style.color = color;
  document.body.appendChild(sparkle);

  sparkle.animate(
    [
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.35) rotate(0deg)' },
      { opacity: 1, offset: 0.18, transform: 'translate(-50%, -50%) scale(1) rotate(15deg)' },
      { opacity: 0, transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(.2) rotate(55deg)` },
    ],
    { duration: 620, easing: 'ease-out' },
  ).finished.finally(() => sparkle.remove());
}

window.addEventListener('pointermove', createMouseSparkle, { passive: true });

window.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  cursorHalo.style.left = `${event.clientX}px`;
  cursorHalo.style.top = `${event.clientY}px`;
  cursorHalo.classList.add('is-visible');
}, { passive: true });
