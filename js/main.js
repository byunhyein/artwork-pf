const folders = document.querySelectorAll('.folder');
const liveClock = document.querySelector('.live-clock');
const dockItems = document.querySelectorAll('.dock-item');
const artworkDock = document.querySelector('.artwork-dock');
const dockActiveIndicator = document.querySelector('.dock-active-indicator');

const artworks = {
  person: [
    { src: 'images/person/a-bite-of-summer.JPG', title: 'a bite of summer' },
    { src: 'images/person/bubble.JPG', title: 'bubble' },
    { src: 'images/person/recording-room.JPG', title: 'recording room' },
  ],
  character: [
    { src: 'images/character/character-study.JPG', title: 'character study' },
    { src: 'images/character/cupcake-character.JPG', title: 'cupcake character' },
    { src: 'images/character/sour-belt.JPG', title: 'sour belt' },
    { src: 'images/character/tanghulu-character.JPG', title: 'tanghulu character' },
  ],
  drawing: [
    { src: 'images/drawing/baby-portrait-study.JPG', title: 'baby portrait study' },
    { src: 'images/drawing/figure-skating.JPG', title: 'figure skating' },
    { src: 'images/drawing/portrait-study-01.JPG', title: 'portrait study 01' },
    { src: 'images/drawing/portrait-study-02.JPG', title: 'portrait study 02' },
    { src: 'images/drawing/portrait-study-03.JPG', title: 'portrait study 03' },
  ],
  object: [
    { src: 'images/object/egg-tart.JPG', title: 'egg tart' },
    { src: 'images/object/pudding.JPG', title: 'pudding' },
    { src: 'images/object/strawberry-cake.JPG', title: 'strawberry cake' },
  ],
};

const categoryLabels = { all: 'ALL ARTWORKS', person: '01. PERSON', character: '02. CHARACTER', drawing: '03. DRAWING', object: '04. OBJECT' };
const archiveModal = document.querySelector('.archive-modal');
const finderWindow = document.querySelector('.finder-window');
const finderTitle = document.querySelector('#finder-title');
const finderCount = document.querySelector('.finder-count');
const finderGallery = document.querySelector('.finder-gallery');
const sidebarButtons = document.querySelectorAll('[data-gallery-category]');
const viewButtons = document.querySelectorAll('[data-view]');
const artworkLightbox = document.querySelector('.artwork-lightbox');
const lightboxImage = document.querySelector('.artwork-lightbox__image');
const lightboxCaption = document.querySelector('.artwork-lightbox__caption');
const lightboxClose = document.querySelector('.artwork-lightbox__close');
let modalReturnFocus = null;
let closeTimer = null;
let activeGalleryItems = [];
let activeArtworkIndex = 0;

function updateClock() {
  if (!liveClock) return;
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
  liveClock.dateTime = now.toISOString();
  liveClock.textContent = `${date}  ${time}`;
  liveClock.setAttribute('aria-label', `현재 시간 ${date}, ${time}`);
}

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

function getGalleryArtworks(category) {
  if (category === 'all') return Object.values(artworks).flat();
  return artworks[category] || [];
}

function renderGallery(category) {
  const items = getGalleryArtworks(category);
  activeGalleryItems = items;
  finderTitle.textContent = categoryLabels[category];
  finderCount.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
  finderGallery.innerHTML = items.map((artwork) => `
    <article class="finder-artwork" role="listitem">
      <button class="finder-thumbnail" type="button" aria-label="${artwork.title} 크게 보기"><img src="${artwork.src}" alt="${artwork.title}" loading="lazy" /></button>
      <h3>${artwork.title}</h3>
      <p>${artwork.src.split('.').pop().toUpperCase()}</p>
    </article>
  `).join('');
  sidebarButtons.forEach((button) => {
    const isActive = button.dataset.galleryCategory === category;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function openGallery(category, trigger) {
  window.clearTimeout(closeTimer);
  modalReturnFocus = trigger || document.activeElement;
  renderGallery(category);
  archiveModal.hidden = false;
  archiveModal.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => archiveModal.classList.add('is-open'));
  finderWindow.focus({ preventScroll: true });
}

function closeGallery() {
  if (archiveModal.hidden) return;
  closeLightbox();
  archiveModal.classList.remove('is-open');
  archiveModal.setAttribute('aria-hidden', 'true');
  closeTimer = window.setTimeout(() => { archiveModal.hidden = true; }, 280);
  modalReturnFocus?.focus?.({ preventScroll: true });
}

function showLightboxItem(index) {
  if (!activeGalleryItems[index]) return;
  activeArtworkIndex = index;
  const artwork = activeGalleryItems[index];
  lightboxImage.src = artwork.src;
  lightboxImage.alt = artwork.title;
  lightboxCaption.textContent = artwork.title;
  document.querySelector('[data-lightbox-previous]').disabled = index === 0;
  document.querySelector('[data-lightbox-next]').disabled = index === activeGalleryItems.length - 1;
}

function openLightbox(image) {
  activeArtworkIndex = [...finderGallery.querySelectorAll('.finder-thumbnail img')].indexOf(image);
  openLightboxAt(activeArtworkIndex);
}

function openLightboxAt(index) {
  showLightboxItem(index);
  artworkLightbox.hidden = false;
  artworkLightbox.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => artworkLightbox.classList.add('is-open'));
  lightboxClose.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!artworkLightbox || artworkLightbox.hidden) return;
  artworkLightbox.classList.remove('is-open');
  artworkLightbox.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    artworkLightbox.hidden = true;
    lightboxImage.src = '';
  }, 180);
  finderWindow.focus({ preventScroll: true });
}

folders.forEach((folder) => folder.addEventListener('click', (event) => {
  event.preventDefault();
  openGallery(folder.dataset.category, folder);
}));

sidebarButtons.forEach((button) => button.addEventListener('click', () => renderGallery(button.dataset.galleryCategory)));
document.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeGallery));
document.querySelectorAll('[data-lightbox-close]').forEach((button) => button.addEventListener('click', closeLightbox));
document.querySelector('[data-lightbox-previous]').addEventListener('click', () => showLightboxItem(activeArtworkIndex - 1));
document.querySelector('[data-lightbox-next]').addEventListener('click', () => showLightboxItem(activeArtworkIndex + 1));
finderGallery.addEventListener('click', (event) => {
  const image = event.target.closest('.finder-thumbnail')?.querySelector('img');
  if (image) openLightbox(image);
});
viewButtons.forEach((button) => button.addEventListener('click', () => {
  const isList = button.dataset.view === 'list';
  finderGallery.classList.toggle('is-list-view', isList);
  viewButtons.forEach((viewButton) => {
    const isActive = viewButton === button;
    viewButton.classList.toggle('is-active', isActive);
    viewButton.setAttribute('aria-pressed', String(isActive));
  });
}));
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!artworkLightbox.hidden) closeLightbox();
  else closeGallery();
});
window.addEventListener('keydown', (event) => {
  if (artworkLightbox.hidden) return;
  if (event.key === 'ArrowLeft') showLightboxItem(activeArtworkIndex - 1);
  if (event.key === 'ArrowRight') showLightboxItem(activeArtworkIndex + 1);
});

dockItems.forEach((item) => item.addEventListener('click', (event) => {
  event.preventDefault();
  const target = item.dataset.dockTarget;
  if (target !== 'random') {
    window.location.hash = target;
    openGallery(target === 'archive' ? 'all' : target, item);
    return;
  }

  window.location.hash = 'random';
  const randomArtwork = Object.entries(artworks).flatMap(([category, items]) => items.map((artwork, index) => ({ category, index, artwork })))[Math.floor(Math.random() * Object.values(artworks).flat().length)];
  openGallery(randomArtwork.category, item);
  openLightboxAt(randomArtwork.index);
}));

updateClock();
window.setInterval(updateClock, 60_000);
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
  sparkle.animate([
    { opacity: 0, transform: 'translate(-50%, -50%) scale(.35) rotate(0deg)' },
    { opacity: 1, offset: 0.18, transform: 'translate(-50%, -50%) scale(1) rotate(15deg)' },
    { opacity: 0, transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(.2) rotate(55deg)` },
  ], { duration: 620, easing: 'ease-out' }).finished.finally(() => sparkle.remove());
}

window.addEventListener('pointermove', createMouseSparkle, { passive: true });
window.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  cursorHalo.style.left = `${event.clientX}px`;
  cursorHalo.style.top = `${event.clientY}px`;
  cursorHalo.classList.add('is-visible');
}, { passive: true });
