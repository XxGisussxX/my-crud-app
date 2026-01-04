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
  getTasksWithFilters,
} from "./logic.js";
import { SELECTORS, PRIORITY_LABELS, PRIORITIES } from "../shared/constants.js";
import { formatDate } from "../shared/utils.js";
import { updateCharts } from "../dashboard/stats.js";
import { showConfirmation } from "../shared/confirmation.js";

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

  // Get filter values from dropdowns or buttons
  let statusFilter = "all";
  let priorityFilter = "all";

  // Try to get values from dropdowns first
  const statusSelect = document.getElementById("statusFilter");
  const prioritySelect = document.getElementById("priorityFilter");

  if (statusSelect) {
    statusFilter = statusSelect.value || "all";
  } else {
    // Fallback to button-based filter
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const filterText = activeFilterBtn
      ? activeFilterBtn.textContent.trim().toLowerCase()
      : "todo";

    const filterMap = {
      todo: "all",
      activas: "active",
      completadas: "completed",
    };
    statusFilter = filterMap[filterText] || "all";
  }

  if (prioritySelect) {
    priorityFilter = prioritySelect.value || "all";
  }

  let tasks = getTasksWithFilters(statusFilter, priorityFilter);

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

  // Get filter values from dropdowns or buttons
  let statusFilter = "all";
  let priorityFilter = "all";

  // Try to get values from dropdowns first
  const statusSelect = document.getElementById("statusFilter");
  const prioritySelect = document.getElementById("priorityFilter");

  if (statusSelect) {
    statusFilter = statusSelect.value || "all";
  } else {
    // Fallback to button-based filter
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const filterText = activeFilterBtn
      ? activeFilterBtn.textContent.trim().toLowerCase()
      : "todo";

    const filterMap = {
      todo: "all",
      activas: "active",
      completadas: "completed",
    };
    statusFilter = filterMap[filterText] || "all";
  }

  if (prioritySelect) {
    priorityFilter = prioritySelect.value || "all";
  }

  let tasks = getTasksWithFilters(statusFilter, priorityFilter);

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
      <div style="display: flex; gap: 8px;">
        <button class="task-action-btn task-toggle" data-id="${
          task.id
        }" style="background: rgba(59, 130, 246, 0.1); border: none; color: #3b82f6; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
          ${task.completed ? "✓" : "Marcar"}
        </button>
        <button class="task-action-btn task-delete" data-id="${
          task.id
        }" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
          Eliminar
        </button>
      </div>
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
      showConfirmation({
        title: "Eliminar tarea",
        message: `¿Estás seguro de que deseas eliminar "${task.text}"?`,
        type: "delete",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        onConfirm: () => {
          deleteTask(task.id);
          renderTasksTable();
          updateStats();
          updateCharts();
        },
      });
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

/**
 * Initialize filter listeners
 */
export function initFilterListeners() {
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      renderTasks();
    });
  }

  if (priorityFilter) {
    priorityFilter.addEventListener("change", () => {
      renderTasks();
    });
  }
}
