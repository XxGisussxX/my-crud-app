/**
 * Tasks UI Module
 * Rendering and DOM management for tasks
 */

import {
  getAllTasks,
  toggleTask,
  deleteTask,
  getTaskStats,
  getFilteredTasks,
} from "./logic.js";
import { SELECTORS, PRIORITY_LABELS, PRIORITIES } from "../shared/constants.js";
import { formatDate } from "../shared/utils.js";
import { updateCharts } from "../dashboard/stats.js";

/**
 * Update task statistics display
 */
export function updateStats() {
  const stats = getTaskStats();
  const completedElement = document.getElementById("tasksCompleted");
  const activeElement = document.getElementById("activeTasks");

  if (completedElement) {
    completedElement.textContent = `${stats.completed} / ${stats.total}`;
  }

  if (activeElement) {
    activeElement.textContent = stats.active;
  }
}

/**
 * Render tasks in grid view
 */
export function renderTasks() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  const activeFilterBtn = document.querySelector(".filter-btn.active");
  const filter = activeFilterBtn
    ? activeFilterBtn.textContent.trim().toLowerCase()
    : "all";

  let tasks = getFilteredTasks(filter);
  tasks.sort((a, b) => a.completed - b.completed);

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="no-results">
        <p>No hay tareas para mostrar</p>
      </div>
    `;
    return;
  }

  tasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    taskList.appendChild(taskCard);
  });
}

/**
 * Create a task card element
 */
export function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = `task-card ${task.completed ? "completed" : ""}`;
  card.id = `task-${task.id}`;

  const dateDisplay = task.date ? formatDate(task.date) : "";
  const priorityLabel = PRIORITY_LABELS[task.priority] || "Media";

  card.innerHTML = `
    <div class="task-header">
      <span class="task-indicator ${task.priority}"></span>
      <div>
        <h3 class="task-title">${escapeHtml(task.text)}</h3>
        ${
          task.description
            ? `<p class="task-description">${escapeHtml(task.description)}</p>`
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
        <span class="priority-badge ${task.priority}">${priorityLabel}</span>
        <button class="task-toggle" data-id="${
          task.id
        }" style="background: rgba(59, 130, 246, 0.1); border: none; color: #3b82f6; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
          ${task.completed ? "✓" : "Marcar"}
        </button>
      </div>
    </div>
  `;

  // Attach event listeners
  const toggleBtn = card.querySelector(".task-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      toggleTask(task.id);
      renderTasks();
      updateStats();
      updateCharts();
    });
  }

  return card;
}

/**
 * Render tasks in table view
 */
export function renderTasksTable() {
  const tbody = document.getElementById("tasksTableBody");
  if (!tbody) return;

  const tasks = getAllTasks();
  tbody.innerHTML = "";

  if (tasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px; color: #9ca3af;">
          No hay tareas
        </td>
      </tr>
    `;
    return;
  }

  tasks.forEach((task) => {
    const row = createTaskRow(task);
    tbody.appendChild(row);
  });
}

/**
 * Create a task table row
 */
export function createTaskRow(task) {
  const row = document.createElement("tr");
  row.className = task.completed ? "completed" : "";
  row.id = `task-row-${task.id}`;

  const dateDisplay = task.date ? formatDate(task.date) : "-";
  const priorityLabel = PRIORITY_LABELS[task.priority] || "Media";

  row.innerHTML = `
    <td>
      <div class="table-title-cell">
        <span class="table-title-indicator ${task.priority}"></span>
        <span class="table-title-text">${escapeHtml(task.text)}</span>
      </div>
    </td>
    <td class="table-description">${escapeHtml(task.description || "-")}</td>
    <td class="table-status">${task.completed ? "Completada" : "Activa"}</td>
    <td>
      <span class="table-priority-badge ${
        task.priority
      }">${priorityLabel}</span>
    </td>
    <td class="table-date">${dateDisplay}</td>
    <td>
      <button class="task-action-btn task-toggle" data-id="${
        task.id
      }" style="background: rgba(59, 130, 246, 0.1); border: none; color: #3b82f6; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
        ${task.completed ? "✓" : "Marcar"}
      </button>
      <button class="task-action-btn task-delete" data-id="${
        task.id
      }" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 4px;">
        Eliminar
      </button>
    </td>
  `;

  // Attach event listeners
  const toggleBtn = row.querySelector(".task-toggle");
  const deleteBtn = row.querySelector(".task-delete");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      toggleTask(task.id);
      renderTasksTable();
      updateStats();
      updateCharts();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (confirm("¿Está seguro de que desea eliminar esta tarea?")) {
        deleteTask(task.id);
        renderTasksTable();
        updateStats();
        updateCharts();
      }
    });
  }

  return row;
}

/**
 * Helper: Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Clear task input fields
 */
export function clearTaskInputs() {
  const inputs = document.querySelectorAll(
    "#taskInput, #taskDesc, #priority, #date"
  );
  inputs.forEach((input) => {
    input.value = "";
  });
}

/**
 * Show/hide empty state
 */
export function updateEmptyState() {
  const taskList = document.getElementById("taskList");
  const tasks = getAllTasks();

  if (tasks.length === 0 && taskList) {
    taskList.innerHTML = `
      <div class="no-results">
        <p>No hay tareas. ¡Crea una nueva!</p>
      </div>
    `;
  }
}

/**
 * Highlight tasks in search results
 */
export function highlightTaskResults(query) {
  const cards = document.querySelectorAll(".task-card");
  const lowerQuery = query.toLowerCase();

  cards.forEach((card) => {
    const title = card.querySelector(".task-title");
    const description = card.querySelector(".task-description");

    if (title && title.textContent.toLowerCase().includes(lowerQuery)) {
      highlightText(title, query);
      card.style.display = "block";
    } else if (
      description &&
      description.textContent.toLowerCase().includes(lowerQuery)
    ) {
      highlightText(description, query);
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * Helper: Highlight text
 */
function highlightText(element, query) {
  const text = element.textContent;
  const regex = new RegExp(`(${query})`, "gi");
  element.innerHTML = text.replace(regex, "<mark>$1</mark>");
}
