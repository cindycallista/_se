const storageKey = 'fixtrack-demo-v1';
const seed = [
  { id: 1, reporter: 'Mia Chen', area: 'Hallway', priority: 'urgent', summary: 'Emergency light does not turn on', resolved: false },
  { id: 2, reporter: 'Ting Yu', area: 'Kitchen', priority: 'low', summary: 'Cabinet hinge is loose', resolved: true }
];
let tickets = [];
let browserMode = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || seed; } catch { return seed; }
}

function saveLocal() {
  if (browserMode) localStorage.setItem(storageKey, JSON.stringify(tickets));
}

function render() {
  const view = document.querySelector('#view').value;
  const visible = tickets.filter(ticket => view === 'all' || (view === 'open' ? !ticket.resolved : ticket.resolved));
  const list = document.querySelector('#ticketList');
  list.innerHTML = visible.map(ticket => `
    <article class="ticket ${ticket.priority} ${ticket.resolved ? 'resolved' : ''}">
      <div class="ticket-code">#${String(ticket.id).padStart(3, '0')}<br>${escapeHtml(ticket.priority[0].toUpperCase() + ticket.priority.slice(1))}</div>
      <div><h3>${escapeHtml(ticket.summary)}</h3><p>${escapeHtml(ticket.area)} · reported by ${escapeHtml(ticket.reporter)}</p></div>
      ${ticket.resolved ? '<div class="ticket-state">Resolved</div>' : `<button type="button" data-resolve="${ticket.id}">Mark resolved</button>`}
    </article>`).join('');
  document.querySelector('#empty').classList.toggle('hidden', visible.length > 0);
  const open = tickets.filter(ticket => !ticket.resolved).length;
  document.querySelector('#openCount').textContent = `${open} open request${open === 1 ? '' : 's'}`;
  saveLocal();
}

async function load() {
  try {
    const response = await fetch('/api/tickets', { headers: { accept: 'application/json' } });
    if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw new Error('No API');
    tickets = await response.json();
    document.querySelector('#mode').textContent = 'Python API connected';
  } catch {
    browserMode = true;
    tickets = readLocal();
    document.querySelector('#mode').textContent = 'GitHub Pages demo';
  }
  document.querySelector('#mode').classList.add('ready');
  render();
}

document.querySelector('#ticketForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const message = document.querySelector('#message');
  try {
    if (browserMode) {
      tickets.push({ ...data, id: Math.max(0, ...tickets.map(item => item.id)) + 1, resolved: false, created_at: new Date().toISOString() });
    } else {
      const response = await fetch('/api/tickets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      tickets.push(result);
    }
    form.reset();
    document.querySelector('#priority').value = 'normal';
    message.textContent = 'Repair request saved.';
    render();
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelector('#ticketList').addEventListener('click', async event => {
  const id = Number(event.target.dataset.resolve);
  if (!id) return;
  try {
    if (!browserMode) {
      const response = await fetch(`/api/tickets/${id}/resolve`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Could not update request.');
    }
    const ticket = tickets.find(item => item.id === id);
    if (ticket) ticket.resolved = true;
    render();
  } catch (error) {
    document.querySelector('#message').textContent = error.message;
  }
});

document.querySelector('#view').addEventListener('change', render);
load();
