const BASE = document.body.dataset.base || './';
const CATEGORIES = [
  ['sports','Fantasy & sports picks','Sports picks and fantasy leads','◈'],
  ['tech','Tech & data','Model-building, code and hackathons','⌘'],
  ['forecasting','Forecasting','Probability and prediction tournaments','◎'],
  ['creative','Creative contests','Writing, design and photography','✳'],
  ['market','Market simulations','Paper-trading leads; verify terms','▥'],
  ['skill','Skill tournaments','Often paid cash rooms or noncash rewards','⚡'],
  ['trivia','Trivia','Quiz and knowledge contests','?'],
  ['pools','Pool tools','Tools; group-funded prizes are not operator cash','▦'],
  ['directory','Directories','Find events; not contests themselves','↗']
];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = id => document.getElementById(id);
const link = (url, label) => url && /^https:\/\//.test(url)
  ? `<a class="source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`
  : '<span class="mutedtext">—</span>';
const cell = (label, content, extra = '') => `<td data-label="${label}"${extra}><div class="cell-content">${content}</div></td>`;
const value = s => esc(s) || '<span class="mutedtext">—</span>';

function table(rows) {
  const body = rows.map(r => {
    const category = CATEGORIES.find(c => c[0] === r.category)?.[1] || r.category;
    const checked = r.sourceStatus === 'checked';
    const name = `<span class="name">${esc(r.name)}</span><span class="subtle">${esc(category)}${r.kind ? ' · ' + esc(r.kind) : ''}</span>`;
    const evidence = `<span class="pill ${checked ? 'good' : 'warn'}">${checked ? 'Page checked' : 'Unverified'}</span>`;
    const source = `${link(r.source, checked ? 'Official page' : 'Unverified research lead')}${r.note ? `<span class="subtle">${esc(r.note)}</span>` : ''}${!r.source ? '<span class="subtle">No operator source located</span>' : ''}`;
    return `<tr>${cell('Listing', name, ' class="listing-cell"')}${cell('Evidence', evidence)}${cell('Cash prize', value(r.prize))}${cell('Entry cost', value(r.entry))}${cell('Deadline', value(r.deadline))}${cell('Official source / lead', source)}</tr>`;
  }).join('');
  return `<div class="table-wrap"><table><thead><tr><th>Listing</th><th>Evidence</th><th>Cash prize</th><th>Entry cost</th><th>Deadline</th><th>Official source / lead</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function render(rows) {
  const page = document.body.dataset.page;
  const checked = rows.filter(r => r.sourceStatus === 'checked');
  const unverified = rows.filter(r => r.sourceStatus !== 'checked');
  if ($('all-count')) $('all-count').textContent = rows.length;
  if ($('checked-count')) $('checked-count').textContent = checked.length;
  if ($('review-count')) $('review-count').textContent = unverified.length;
  if ($('category-grid')) $('category-grid').innerHTML = CATEGORIES.map(c => `<a class="card" href="${BASE}category/${c[0]}.html"><span class="icon" aria-hidden="true">${c[3]}</span><h3>${esc(c[1])}</h3><p>${esc(c[2])}</p><span class="count">${rows.filter(r => r.category === c[0]).length} leads →</span></a>`).join('');

  const initial = page === 'review' ? unverified : page === 'category' ? rows.filter(r => r.category === document.body.dataset.category) : checked;
  const search = $('search'), status = $('status'), kind = $('kind');
  // This filter uses only explicitly documented free-entry fields; blank is NOT free.
  const free = document.createElement('select');
  free.id = 'entry-filter';
  free.setAttribute('aria-label', 'Entry cost evidence');
  free.innerHTML = '<option value="">All entry costs</option><option value="confirmed-free">Confirmed free entry</option><option value="unknown">Entry cost unknown</option>';
  kind?.after(free);

  function update() {
    const q = (search?.value || '').trim().toLowerCase();
    const current = initial.filter(r => {
      const freeEntry = r.sourceStatus === 'checked' && (r.entry === 'Free' || r.entry.startsWith('Free ('));
      return (!q || [r.name, r.category, r.note, r.source].join(' ').toLowerCase().includes(q))
        && (!status?.value || r.sourceStatus === status.value)
        && (!kind?.value || r.kind === kind.value)
        && (!free.value || (free.value === 'confirmed-free' ? freeEntry : !r.entry));
    });
    $('rows').innerHTML = current.length ? table(current) : '<div class="empty">No matches. Try a different search or filter.</div>';
    $('result-count').textContent = `${current.length} of ${initial.length} listings`;
  }
  [search, status, kind, free].forEach(el => el?.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', update));
  update();
}

fetch(`${BASE}data/entries.json`)
  .then(r => { if (!r.ok) throw Error('Data unavailable'); return r.json(); })
  .then(render)
  .catch(() => { $('rows').innerHTML = '<div class="empty">Could not load the catalog. Try refreshing the page.</div>'; });
