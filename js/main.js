const grid = document.getElementById('productGrid');
const select = document.getElementById('productSelect');

function renderProducts(filter) {
  grid.innerHTML = PRODUCTS
    .filter(p => filter === 'all' || p.cat === filter)
    .map(p => `
      <article class="card" data-id="${p.id}" tabindex="0" style="--accent:${p.color}">
        <div class="card-img"><img src="images/products/${p.id}.png" alt="${p.name}" loading="lazy"></div>
        <div class="card-body">
          <span class="badge">${CATEGORIES[p.cat]}</span>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="card-foot"><span>📦 ${p.pack}</span><span class="more">Details →</span></div>
        </div>
      </article>`).join('');
}
renderProducts('all');

PRODUCTS.forEach(p => select.insertAdjacentHTML('beforeend', `<option>${p.name}</option>`));

document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
  document.querySelector('.chip.active').classList.remove('active');
  chip.classList.add('active');
  renderProducts(chip.dataset.filter);
}));

// Product modal
const modal = document.getElementById('modal');
let current = null;

function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  current = p;
  modal.querySelector('.modal-card').style.setProperty('--accent', p.color);
  document.getElementById('mImg').src = `images/products/${p.id}.png`;
  document.getElementById('mImg').alt = p.name;
  document.getElementById('mCat').textContent = CATEGORIES[p.cat];
  document.getElementById('mName').textContent = p.name;
  document.getElementById('mDesc').textContent = p.desc;
  document.getElementById('mSpecs').innerHTML = p.specs.map(s => `<li>${s}</li>`).join('');
  document.getElementById('mPack').textContent = p.pack;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

grid.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (card) openModal(card.dataset.id);
});
grid.addEventListener('keydown', e => {
  const card = e.target.closest('.card');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openModal(card.dataset.id); }
});
modal.addEventListener('click', e => {
  if (e.target === modal || e.target.classList.contains('modal-close')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('mEnquire').addEventListener('click', () => {
  select.value = current.name;
  closeModal();
});

// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });

// Contact form opens the user's email client (static site, no backend)
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = `Enquiry: ${f.get('product') || 'General'} — ${f.get('name')}`;
  const body = `Name: ${f.get('name')}\nPhone: ${f.get('phone')}\nProduct: ${f.get('product') || 'General enquiry'}\n\n${f.get('message')}`;
  location.href = `mailto:nutrimoagriscience@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById('year').textContent = new Date().getFullYear();
