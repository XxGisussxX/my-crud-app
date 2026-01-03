import { toggleTask, deleteTask } from "./logic.js";
import { getTasks } from "./storage.js";
import { updateCharts } from "./charts.js";
import { showConfirmation } from "./confirmation.js";

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

  // Determinar filtro activo (All / Active / Completed)
  const activeFilterBtn = document.querySelector(".filter-btn.active");
  const filter = activeFilterBtn
    ? activeFilterBtn.textContent.trim().toLowerCase()
    : "all";

  // Aplicar filtro a las tareas antes de renderizar
  let filteredTasks = tasks;
  if (filter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (filter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }
   // Ordenar tareas: activas primero, luego completadas
  filteredTasks.sort((a, b) => a.completed - b.completed);
  list.innerHTML = "";

  filteredTasks.forEach((task) => {
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
          }" class="toggle" style="background: rgba(59, 130, 246, 0.1); border: none; color: #3b82f6; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">${
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

  // Delegación de eventos (añadir listener una sola vez)
  if (!list.dataset.listenerAdded) {
    list.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains("toggle")) {
        toggleTask(id);
        renderTasks();
        updateStats();
        updateCharts();
      }

      if (e.target.classList.contains("delete")) {
        // Obtener el título de la tarea para mostrar en confirmación
        const task = getTasks().find((t) => t.id === id);
        const taskTitle = task ? task.text : "esta tarea";

        showConfirmation({
          title: "Eliminar tarea",
          message: `¿Estás seguro de que deseas eliminar "${taskTitle}"?`,
          type: "delete",
          confirmText: "Eliminar",
          cancelText: "Cancelar",
          onConfirm: () => {
            deleteTask(id);
            renderTasks();
            updateStats();
            updateCharts();
          },
        });
      }
    });
    list.dataset.listenerAdded = "true";
  }

  // Actualizar estadísticas después de renderizar
  updateStats();
}

// Función para renderizar las tareas en formato de tabla
export function renderTasksTable() {
  const tableBody = document.getElementById("tasksTableBody");
  const tasks = getTasks();

  // Determinar filtro activo (All / Active / Completed)
  const activeFilterBtn = document.querySelector(".filter-btn.active");
  const filter = activeFilterBtn
    ? activeFilterBtn.textContent.trim().toLowerCase()
    : "all";

  // Aplicar filtro a las tareas antes de renderizar
  let filteredTasks = tasks;
  if (filter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (filter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  // Ordenar tareas: activas primero, luego completadas
  filteredTasks.sort((a, b) => a.completed - b.completed);

  tableBody.innerHTML = "";

  if (filteredTasks.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: #9ca3af;">
          No hay tareas para mostrar
        </td>
      </tr>
    `;
    return;
  }

  filteredTasks.forEach((task) => {
    const row = document.createElement("tr");
    row.setAttribute("data-task-id", task.id);
    if (task.completed) {
      row.classList.add("completed");
    }

    // Formatear fecha si existe
    let dateDisplay = "";
    if (task.date) {
      const date = new Date(task.date);
      const options = { month: "short", day: "numeric" };
      dateDisplay = date.toLocaleDateString("es-ES", options) + ",";
    }

    // Mapear prioridad a clases CSS y etiquetas
    const priorityClass = task.completed ? "done" : task.priority || "medium";
    const priorityLabels = {
      high: "Alta",
      medium: "Media",
      low: "Baja",
      done: "Completada",
    };

    // Determinar el indicador de título
    let titleIndicator = "";
    if (task.completed) {
      titleIndicator = '<span class="table-title-indicator completed"></span>';
    } else {
      titleIndicator = `<span class="table-title-indicator ${priorityClass}"></span>`;
    }

    // Truncar descripción si es muy larga
    const description = task.description || "";
    const truncatedDescription =
      description.length > 50
        ? description.substring(0, 50) + "..."
        : description;

    row.innerHTML = `
      <td>
        <div class="table-title-cell">
          ${titleIndicator}
          <span class="table-title-text">${task.text}</span>
        </div>
      </td>
      <td>
        <span class="table-description">${truncatedDescription}</span>
      </td>
      <td>
        <span class="table-status">${
          task.completed ? "Completada" : "Activa"
        }</span>
      </td>
      <td>
        <span class="table-priority-badge ${priorityClass}">${
      priorityLabels[priorityClass] || "Medium"
    }</span>
      </td>
      <td>
        <span class="table-date">${dateDisplay}</span>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Delegación de eventos para hacer clic en las filas (toggle completado)
  if (!tableBody.dataset.listenerAdded) {
    tableBody.addEventListener("click", (e) => {
      const row = e.target.closest("tr[data-task-id]");
      if (!row) return;

      const taskId = row.getAttribute("data-task-id");
      if (taskId) {
        toggleTask(taskId);
        renderTasksTable();
        updateStats();
        updateCharts();
      }
    });
    tableBody.dataset.listenerAdded = "true";
  }
}
