const catalog = [
  { code: "CS301", name: "Software Engineering", credits: 3, day: "Monday", period: 2, room: "E210" },
  { code: "CS315", name: "Computer Networks", credits: 3, day: "Tuesday", period: 3, room: "E305" },
  { code: "CS322", name: "Database Systems", credits: 3, day: "Wednesday", period: 2, room: "E204" },
  { code: "CS340", name: "Web Application Development", credits: 3, day: "Thursday", period: 4, room: "E312" },
  { code: "CS351", name: "Introduction to AI", credits: 3, day: "Friday", period: 3, room: "E306" },
  { code: "GE208", name: "Technical English", credits: 2, day: "Tuesday", period: 1, room: "A107" },
  { code: "GE221", name: "Island Culture", credits: 2, day: "Thursday", period: 2, room: "A203" }
];

const initialCodes = ["CS301", "CS315", "GE208"];
let enrolled = new Set(JSON.parse(localStorage.getItem("coursedesk-enrolled") || JSON.stringify(initialCodes)));

const titles = {
  dashboard: "Semester overview",
  courses: "Course selection",
  timetable: "Weekly timetable"
};

function save() {
  localStorage.setItem("coursedesk-enrolled", JSON.stringify([...enrolled]));
}

function selectedCourses() {
  return catalog.filter(course => enrolled.has(course.code));
}

function showMessage(text, error = false) {
  const node = document.querySelector("#message");
  node.textContent = text;
  node.classList.toggle("error", error);
}

function toggleCourse(code) {
  const course = catalog.find(item => item.code === code);
  if (enrolled.has(code)) {
    enrolled.delete(code);
    showMessage(`${course.name} was removed.`);
  } else {
    const conflict = selectedCourses().find(item => item.day === course.day && item.period === course.period);
    const credits = selectedCourses().reduce((sum, item) => sum + item.credits, 0);
    if (conflict) {
      showMessage(`Schedule conflict with ${conflict.name}.`, true);
      return;
    }
    if (credits + course.credits > 25) {
      showMessage("The 25-credit demonstration limit would be exceeded.", true);
      return;
    }
    enrolled.add(code);
    showMessage(`${course.name} was added.`);
  }
  save();
  renderAll();
}

function renderCourses() {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  const day = document.querySelector("#day-filter").value;
  const matches = catalog.filter(course => {
    const textMatch = `${course.code} ${course.name}`.toLowerCase().includes(query);
    return textMatch && (day === "all" || course.day === day);
  });
  document.querySelector("#course-list").innerHTML = matches.map(course => `
    <article class="course-row">
      <div><h3>${course.name}</h3><p>${course.code} · ${course.room}</p></div>
      <div class="course-meta">${course.day}<br>Period ${course.period} · ${course.credits} credits</div>
      <button class="${enrolled.has(course.code) ? "drop" : ""}" data-code="${course.code}">
        ${enrolled.has(course.code) ? "Drop" : "Add"}
      </button>
    </article>
  `).join("") || "<p>No matching courses.</p>";
  document.querySelectorAll("[data-code]").forEach(button => {
    button.addEventListener("click", () => toggleCourse(button.dataset.code));
  });
}

function renderOverview() {
  const courses = selectedCourses();
  document.querySelector("#course-count").textContent = courses.length;
  document.querySelector("#credit-count").textContent = courses.reduce((sum, course) => sum + course.credits, 0);
  document.querySelector("#enrolled-body").innerHTML = courses.map(course => `
    <tr><td>${course.code}</td><td>${course.name}</td><td>${course.credits}</td><td>${course.day}, period ${course.period}</td></tr>
  `).join("") || '<tr><td colspan="4">No enrolled courses.</td></tr>';
}

function renderTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  document.querySelector("#schedule-body").innerHTML = [1, 2, 3, 4, 5].map(period => `
    <tr>
      <td>Period ${period}</td>
      ${days.map(day => {
        const course = selectedCourses().find(item => item.day === day && item.period === period);
        return `<td>${course ? `<div class="slot">${course.code}<br>${course.room}</div>` : ""}</td>`;
      }).join("")}
    </tr>
  `).join("");
}

function renderAll() {
  renderOverview();
  renderCourses();
  renderTimetable();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item, .view").forEach(node => node.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
    document.querySelector("#page-title").textContent = titles[button.dataset.view];
  });
});
document.querySelector("#search").addEventListener("input", renderCourses);
document.querySelector("#day-filter").addEventListener("change", renderCourses);
document.querySelector("#reset-button").addEventListener("click", () => {
  enrolled = new Set(initialCodes);
  save();
  showMessage("Demo data was reset.");
  renderAll();
});

renderAll();

