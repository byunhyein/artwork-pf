const folders = document.querySelectorAll('.folder');
const liveClock = document.querySelector('.live-clock');

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
