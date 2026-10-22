const storageKey = 'stackboard-demo-tasks';
const defaults = [
  { id: 3, title: 'Verify database persistence', category: 'PostgreSQL', done: false },
  { id: 2, title: 'Review reverse proxy route', category: 'Nginx', done: false },
  { id: 1, title: 'Check service health', category: 'Operations', done: true }
];

let demoMode = location.hostname.endsWith('github.io') || location.protocol === 'file:';
let tasks = [];

const list = document.querySelector('#task-list');
const count = document.querySelector('#task-count');
const mode = document.querySelector('#mode');
const message = document.querySelector('#message');
const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const categoryInput = document.querySelector('#task-category');

function getDemoTasks() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : defaults;
}

function saveDemoTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function render() {
  list.replaceChildren();
  tasks.forEach((task) => {
    const row = document.createElement('tr');
    row.className = task.done ? 'done' : '';
    row.innerHTML = `<td><button class="action status-button" data-action="toggle" data-id="${task.id}">${task.done ? 'Completed' : 'Open'}</button></td><td class="task-title"></td><td></td><td><button class="action" data-action="delete" data-id="${task.id}">Delete</button></td>`;
    row.children[1].textContent = task.title;
    row.children[2].textContent = task.category;
    list.append(row);
  });
  count.textContent = `${tasks.filter((task) => !task.done).length} open / ${tasks.length} total`;
  mode.textContent = demoMode ? 'GitHub Pages demo' : 'Docker services connected';
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) throw new Error('The service returned an error.');
  return response.status === 204 ? null : response.json();
}

async function loadTasks() {
  if (demoMode) {
    tasks = getDemoTasks();
    render();
    return;
  }
  try {
    tasks = await api('/api/tasks');
  } catch {
    demoMode = true;
    tasks = getDemoTasks();
    message.textContent = 'API unavailable. Browser demo mode is active.';
  }
  render();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newTask = { title: titleInput.value.trim(), category: categoryInput.value };
  if (!newTask.title) return;
  if (demoMode) {
    tasks.unshift({ ...newTask, id: Date.now(), done: false });
    saveDemoTasks();
  } else {
    tasks.unshift(await api('/api/tasks', { method: 'POST', body: JSON.stringify(newTask) }));
  }
  titleInput.value = '';
  message.textContent = 'Task added.';
  render();
});

list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  const task = tasks.find((item) => item.id === id);
  if (button.dataset.action === 'toggle') {
    if (demoMode) {
      task.done = !task.done;
      saveDemoTasks();
    } else {
      const updated = await api(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done: !task.done }) });
      Object.assign(task, updated);
    }
  } else if (button.dataset.action === 'delete') {
    if (!demoMode) await api(`/api/tasks/${id}`, { method: 'DELETE' });
    tasks = tasks.filter((item) => item.id !== id);
    if (demoMode) saveDemoTasks();
  }
  render();
});

loadTasks();
