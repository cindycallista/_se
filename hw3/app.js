const seed = [
  { id: 1, type: "income", description: "Part-time work", category: "Income", amount: 6200, date: "2026-10-05" },
  { id: 2, type: "expense", description: "Textbook", category: "Study", amount: 780, date: "2026-10-08" },
  { id: 3, type: "expense", description: "Weekly groceries", category: "Food", amount: 1250, date: "2026-10-12" }
];

let transactions = JSON.parse(localStorage.getItem("pocketledger-transactions") || JSON.stringify(seed));
let budget = Number(localStorage.getItem("pocketledger-budget") || 10000);

const money = value => `NT$${value.toLocaleString("en-US")}`;

function save() {
  localStorage.setItem("pocketledger-transactions", JSON.stringify(transactions));
  localStorage.setItem("pocketledger-budget", String(budget));
}

function removeTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  save();
  render();
}

function renderTotals() {
  const income = transactions.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  document.querySelector("#income").textContent = money(income);
  document.querySelector("#expense").textContent = money(expense);
  document.querySelector("#balance").textContent = money(income - expense);
  document.querySelector("#budget").value = budget;
  const remaining = budget - expense;
  const note = document.querySelector("#budget-message");
  note.textContent = remaining >= 0 ? `${money(remaining)} remains in the monthly expense budget.` : `Budget exceeded by ${money(Math.abs(remaining))}.`;
  note.classList.toggle("warning", remaining < 0);
}

function renderTable() {
  const filter = document.querySelector("#filter").value;
  const visible = transactions
    .filter(item => filter === "all" || item.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));
  document.querySelector("#transaction-body").innerHTML = visible.map(item => `
    <tr>
      <td>${item.date}</td><td>${item.description}</td><td>${item.category}</td>
      <td class="money-${item.type}">${item.type === "income" ? "+" : "−"}${money(item.amount)}</td>
      <td><button class="delete" data-delete="${item.id}">Delete</button></td>
    </tr>
  `).join("") || '<tr><td colspan="5">No transactions.</td></tr>';
  document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => removeTransaction(Number(button.dataset.delete)));
  });
}

function render() {
  renderTotals();
  renderTable();
}

document.querySelector("#date").valueAsDate = new Date();
document.querySelector("#filter").addEventListener("change", renderTable);
document.querySelector("#budget").addEventListener("change", event => {
  budget = Math.max(0, Number(event.target.value));
  save();
  renderTotals();
});
document.querySelector("#transaction-form").addEventListener("submit", event => {
  event.preventDefault();
  transactions.push({
    id: Date.now(),
    type: document.querySelector("#type").value,
    description: document.querySelector("#description").value.trim(),
    category: document.querySelector("#category").value,
    amount: Number(document.querySelector("#amount").value),
    date: document.querySelector("#date").value
  });
  event.target.reset();
  document.querySelector("#date").valueAsDate = new Date();
  save();
  render();
});
document.querySelector("#export").addEventListener("click", () => {
  const rows = [["date", "type", "description", "category", "amount"], ...transactions.map(item => [item.date, item.type, item.description, item.category, item.amount])];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "pocketledger.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

render();

