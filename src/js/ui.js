import { toggleTask, deleteTask } from "./logic.js";
import { getTasks } from "./storage.js";

export function renderTasks() {
  const list = document.getElementById("taskList");
  const tasks = getTasks();

  list.innerHTML = "";

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <span class="text ${task.completed ? "done" : ""}">
        ${task.text}
      </span>

      <button data-id="${task.id}" class="toggle">✔</button>
      <button data-id="${task.id}" class="delete">🗑</button>
    `;

    list.appendChild(div);
  });

  // Delegación de eventos
  list.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("toggle")) {
      toggleTask(id);
      renderTasks();
    }

    if (e.target.classList.contains("delete")) {
      deleteTask(id);
      renderTasks();
    }
  });
}
