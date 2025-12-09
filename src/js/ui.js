import { toggleTask, deleteTask } from "./logic.js";
import { getTasks } from "./storage.js";

// Función para actualizar las estadísticas del contador
export function updateStats() {
  const tasks = getTasks();
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.filter((task) => !task.completed).length;

  // Actualizar el contador de tareas completadas
  const completedElement = document.getElementById("tasksCompleted");
  if (completedElement) {
    completedElement.textContent = `${completed} / ${total}`;
  }

  // Actualizar el contador de tareas activas
  const activeElement = document.getElementById("activeTasks");
  if (activeElement) {
    activeElement.textContent = active;
  }
}

export function renderTasks() {
  const list = document.getElementById("taskList");
  const tasks = getTasks();

  list.innerHTML = "";

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card ${task.completed ? "completed" : ""}`;

    // Formatear fecha si existe
    let dateDisplay = "";
    if (task.date) {
      const date = new Date(task.date);
      const options = { year: "numeric", month: "short", day: "numeric" };
      dateDisplay = date.toLocaleDateString("es-ES", options);
    }

    // Mapear prioridad a clases CSS
    const priorityClass = task.priority || "medium";
    const priorityLabels = {
      high: "Alta",
      medium: "Media",
      low: "Baja",
      done: "Completada",
    };

    taskCard.innerHTML = `
      <div class="task-header">
        <span class="task-indicator ${priorityClass}"></span>
        <div>
          <h3 class="task-title">${task.text}</h3>
          ${
            task.description
              ? `<p class="task-description">${task.description}</p>`
              : ""
          }
        </div>
      </div>
      <div class="task-footer">
        ${
          dateDisplay
            ? `
          <span class="task-date">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            ${dateDisplay}
          </span>
        `
            : ""
        }
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="priority-badge ${priorityClass}">${
      priorityLabels[priorityClass] || "Media"
    }</span>
          <button data-id="${
            task.id
          }" class="toggle" style="background: rgba(102, 126, 234, 0.2); border: none; color: #667eea; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">${
      task.completed ? "✓" : "Marcar"
    }</button>
          <button data-id="${
            task.id
          }" class="delete" style="background: rgba(255, 77, 77, 0.2); border: none; color: #ff4d4d; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">Eliminar</button>
        </div>
      </div>
    `;

    list.appendChild(taskCard);
  });

  // Delegación de eventos
  list.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("toggle")) {
      toggleTask(id);
      renderTasks();
      updateStats();
    }

    if (e.target.classList.contains("delete")) {
      deleteTask(id);
      renderTasks();
      updateStats();
    }
  });

  // Actualizar estadísticas después de renderizar
  updateStats();
}
