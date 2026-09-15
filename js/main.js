const folders = document.querySelectorAll('.folder');
const liveClock = document.querySelector('.live-clock');
const dockItems = document.querySelectorAll('.dock-item');
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
    item.classList.toggle('is-active', item.dataset.dockTarget === currentTarget);
  });
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
