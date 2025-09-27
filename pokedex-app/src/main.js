import './style.css';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const nameEL = document.querySelector('#pokemon-name');
const idEL = document.querySelector('#pokemon-id');
const imgEL = document.querySelector('#pokemon-img');
const typesEL = document.querySelector('#pokemon-types');
const statsEL = document.querySelector('#pokemon-stats');
const loadingEl = document.querySelector('#loading');
const errorEl = document.querySelector('#error');
const pokemonEl = document.querySelector('#pokemon');
const submitBtn = form.querySelector('button[type="submit"]');

const normalize = s =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();

const setLoading = on => {
  loadingEl.hidden = !on;
  submitBtn.disabled = on;
};

const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  pokemonEl.hidden = true;
  errorEl.hidden = true;
  setLoading(true);

  const query = normalize(input.value);
  if (!query) {
    setLoading(false);
    errorEl.hidden = false;
    errorEl.textContent = 'Pokemon not found';
    return;
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
    .then(response => {
      if (!response.ok) throw new Error(response.status);
      return response.json();
    })
    .then((data) => {
      // Nombre e ID
      nameEL.textContent = cap(data.name);
      idEL.textContent = `#${data.id}`;

      // Imagen (fallbacks)
      const sprite =
        data?.sprites?.other?.['official-artwork']?.front_default ||
        data?.sprites?.front_default ||
        '';
      imgEL.src = sprite;
      imgEL.alt = data.name || 'pokemon';

      // Tipos
      typesEL.innerHTML = '';
      data.types.forEach(t => {
        const span = document.createElement('span');
        span.textContent = t.type.name;
        span.classList.add('type-pill', `type-${t.type.name}`);
        typesEL.appendChild(span);
      });

      // Stats (con clases low/mid/high)
      statsEL.innerHTML = '';
      data.stats.forEach(s => {
        const value = s.base_stat;
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
          <span class="stat-name">${s.stat.name}</span>
          <span class="stat-value">${value}</span>
          <div class="stat-bar">
            <div class="stat-fill" style="width:${Math.min(value,150)/1.5}%"></div>
          </div>
        `;
        const fill = row.querySelector('.stat-fill');
        fill.classList.add(value < 60 ? 'low' : value < 100 ? 'mid' : 'high');
        statsEL.appendChild(row);
      });

      errorEl.hidden = true;
      pokemonEl.hidden = false;
    })
    .catch(() => {
      pokemonEl.hidden = true;
      errorEl.hidden = false;
      errorEl.textContent = 'Pokemon not found';
    })
    .finally(() => {
      setLoading(false);
    });
});
