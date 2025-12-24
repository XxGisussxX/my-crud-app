import { addTask, toggleTask, deleteTask } from "./logic.js";
import { renderTasks, updateStats, renderTasksTable } from "./ui.js";
import { initCharts, updateCharts } from "./charts.js";
import { initCalendar, updateCalendarEvents } from "./calendar.js";
import { getTasks, saveTasks } from "./storage.js";
import { showConfirmation } from "./confirmation.js";
import { Input } from "postcss";

// Hacer funciones disponibles globalmente para compatibilidad
window.getTasks = getTasks;
window.saveTasks = saveTasks;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.renderTasks = renderTasks;
window.renderTasksTable = renderTasksTable;
window.updateStats = updateStats;
window.showConfirmation = showConfirmation;
window.updateCharts = updateCharts;

// ============================================
// UTILIDADES DE BÚSQUEDA Y DEBOUNCE
// ============================================

// Función debounce para retrasar la ejecución de búsquedas
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Variables globales para el estado de búsqueda
let searchState = {
  currentQuery: "",
  currentSection: "tareas",
};

// ============================================
// FUNCIONES DE ALMACENAMIENTO DE NOTAS
// ============================================

// Obtener notas desde localStorage
function getNotes() {
  return JSON.parse(localStorage.getItem("notes")) || [];
}

// Guardar notas en localStorage
function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Función para crear una nueva nota
function createNote(noteData) {
  const notes = getNotes();
  const newNote = {
    id: crypto.randomUUID(),
    type: noteData.type,
    title: noteData.title,
    content: noteData.content,
    color: noteData.color || getDefaultColor(noteData.type),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...noteData.specificData, // Datos específicos según el tipo
  };
  notes.push(newNote);
  saveNotes(notes);
  renderNotes();
  return newNote;
}

// Función para obtener color por defecto según el tipo
function getDefaultColor(type) {
  const colors = {
    standard: "#fef3c7", // yellow
    checklist: "#d1fae5", // green
    idea: "#fce7f3", // pink
    meeting: "#dbeafe", // blue
    sticky: "#fef3c7", // yellow
  };
  return colors[type] || "#ffffff";
}

// ============================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// ============================================

// Función para filtrar tareas basada en el texto de búsqueda
function filterTasks(tasks, query) {
  if (!query.trim()) return tasks;

  const searchQuery = query.toLowerCase();
  return tasks.filter(
    (task) =>
      task.text.toLowerCase().includes(searchQuery) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery)) ||
      task.priority.toLowerCase().includes(searchQuery)
  );
}

// Función para filtrar notas basada en el texto de búsqueda
function filterNotes(notes, query) {
  if (!query.trim()) return notes;

  const searchQuery = query.toLowerCase();
  return notes.filter((note) => {
    // Búsqueda en título
    if (note.title && note.title.toLowerCase().includes(searchQuery))
      return true;

    // Búsqueda en contenido
    if (note.content && note.content.toLowerCase().includes(searchQuery))
      return true;

    // Búsqueda en tipo de nota
    if (note.type && note.type.toLowerCase().includes(searchQuery)) return true;

    // Búsqueda en datos específicos según el tipo
    if (note.specificData) {
      const specificDataString = JSON.stringify(
        note.specificData
      ).toLowerCase();
      if (specificDataString.includes(searchQuery)) return true;
    }

    return false;
  });
}

// Función para filtrar eventos del calendario (si los implementas en el futuro)
function filterEvents(events, query) {
  if (!query.trim()) return events;

  const searchQuery = query.toLowerCase();
  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery) ||
      (event.description &&
        event.description.toLowerCase().includes(searchQuery))
  );
}

// Función principal de búsqueda que maneja todas las secciones
function performSearch(query) {
  searchState.currentQuery = query;

  const activeSection = document.querySelector(".section-content.active");
  if (!activeSection) return;

  const sectionId = activeSection.id;
  searchState.currentSection = sectionId;

  switch (sectionId) {
    case "tareas-section":
      searchAndRenderTasks(query);
      break;
    case "tablas-section":
      searchAndRenderTasksTable(query);
      break;
    case "notas-section":
      searchAndRenderNotes(query);
      break;
    case "calendario-section":
      // Implementar cuando tengas eventos del calendario
      console.log("Búsqueda en calendario:", query);
      break;
    default:
      console.log("Sección no soportada para búsqueda:", sectionId);
  }
}

// Función específica para búsqueda y renderizado de tareas
function searchAndRenderTasks(query) {
  const allTasks = getTasks();
  const filteredTasks = filterTasks(allTasks, query);

  // Re-renderizar con tareas filtradas
  renderTasksWithFilter(filteredTasks);
}

// Función específica para búsqueda y renderizado de tabla de tareas
function searchAndRenderTasksTable(query) {
  // Re-renderizar tabla con tareas filtradas
  renderTasksTableWithFilter(filteredTasks);
}

// Función específica para búsqueda y renderizado de notas
function searchAndRenderNotes(query) {
  const allNotes = getNotes();
  const filteredNotes = filterNotes(allNotes, query);

  // Re-renderizar notas filtradas
  renderNotesWithFilter(filteredNotes);
}

// Función debouncedSearch que se ejecutará con retraso
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300); // 300ms de retraso

// ============================================
// FUNCIONES DE RENDERIZADO CON FILTRO
// ============================================

// Función para renderizar tareas con filtro de búsqueda
function renderTasksWithFilter(filteredTasks) {
  const list = document.getElementById("taskList");
  if (!list) return;

  // Determinar filtro activo (All / Active / Completed)
  const activeFilterBtn = document.querySelector(".filter-btn.active");
  const filter = activeFilterBtn
    ? activeFilterBtn.textContent.trim().toLowerCase()
    : "all";

  // Aplicar filtro de estado a las tareas ya filtradas por búsqueda
  let finalTasks = filteredTasks;
  if (filter === "active") {
    finalTasks = filteredTasks.filter((t) => !t.completed);
  } else if (filter === "completed") {
    finalTasks = filteredTasks.filter((t) => t.completed);
  }

  list.innerHTML = "";

  if (finalTasks.length === 0) {
    list.innerHTML = `<div class="no-results">No se encontraron tareas que coincidan con "${searchState.currentQuery}"</div>`;
    return;
  }

  finalTasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card ${task.completed ? "completed" : ""}`;

    let dateDisplay = "";
    if (task.date) {
      const date = new Date(task.date);
      const options = { year: "numeric", month: "short", day: "numeric" };
      dateDisplay = date.toLocaleDateString("es-ES", options);
    }

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
          <h3 class="task-title">${highlightMatch(
            task.text,
            searchState.currentQuery
          )}</h3>
          ${
            task.description
              ? `<p class="task-description">${highlightMatch(
                  task.description,
                  searchState.currentQuery
                )}</p>`
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

  // Delegación de eventos para botones (similar a la función original)
  if (!list.dataset.searchListenerAdded) {
    list.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains("toggle")) {
        toggleTask(id);
        debouncedSearch(searchState.currentQuery);
        updateStats();
        updateCharts();
      }

      if (e.target.classList.contains("delete")) {
        // Obtener el título de la tarea para mostrar en confirmación
        const allTasks = getTasks();
        const task = allTasks.find((t) => t.id === id);
        const taskTitle = task ? task.text : "esta tarea";

        // Usar confirmación si está disponible, sino usar confirm básico
        if (window.showConfirmation) {
          showConfirmation({
            title: "Eliminar tarea",
            message: `¿Estás seguro de que deseas eliminar "${taskTitle}"?`,
            type: "delete",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            onConfirm: () => {
              deleteTask(id);
              debouncedSearch(searchState.currentQuery);
              updateStats();
              updateCharts();
            },
          });
        } else {
          if (confirm(`¿Estás seguro de que deseas eliminar "${taskTitle}"?`)) {
            deleteTask(id);
            debouncedSearch(searchState.currentQuery);
            updateStats();
            updateCharts();
          }
        }
      }
    });
    list.dataset.searchListenerAdded = "true";
  }

  // Actualizar estadísticas
  if (updateStats) updateStats();
}

// Función para renderizar tabla de tareas con filtro de búsqueda
function renderTasksTableWithFilter(filteredTasks) {
  const tableBody = document.getElementById("tasksTableBody");
  if (!tableBody) return;

  // Aplicar filtro de estado
  const activeFilterBtn = document.querySelector(".filter-btn.active");
  const filter = activeFilterBtn
    ? activeFilterBtn.textContent.trim().toLowerCase()
    : "all";

  let finalTasks = filteredTasks;
  if (filter === "active") {
    finalTasks = filteredTasks.filter((t) => !t.completed);
  } else if (filter === "completed") {
    finalTasks = filteredTasks.filter((t) => t.completed);
  }

  tableBody.innerHTML = "";

  if (finalTasks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="no-results">No se encontraron tareas que coincidan con "${searchState.currentQuery}"</td></tr>`;
    return;
  }

  finalTasks.forEach((task) => {
    const row = document.createElement("tr");
    row.className = task.completed ? "completed" : "";

    let dateDisplay = task.date || "Sin fecha";
    if (task.date) {
      const date = new Date(task.date);
      const options = { year: "numeric", month: "short", day: "numeric" };
      dateDisplay = date.toLocaleDateString("es-ES", options);
    }

    const priorityLabels = {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    };

    row.innerHTML = `
      <td><input type="checkbox" ${
        task.completed ? "checked" : ""
      } data-task-id="${task.id}"></td>
      <td class="task-title-cell">${highlightMatch(
        task.text,
        searchState.currentQuery
      )}</td>
      <td class="task-desc-cell">${
        task.description
          ? highlightMatch(task.description, searchState.currentQuery)
          : "-"
      }</td>
      <td><span class="priority-badge ${task.priority}">${
      priorityLabels[task.priority] || "Media"
    }</span></td>
      <td class="date-cell">${dateDisplay}</td>
      <td class="actions-cell">
        <button class="btn-table delete-btn" data-task-id="${task.id}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Agregar event listeners para checkboxes y botones de eliminar
  tableBody.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const taskId = e.target.getAttribute("data-task-id");
      toggleTask(taskId);
      debouncedSearch(searchState.currentQuery);
    });
  });

  tableBody.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const taskId = e.target.closest("button").getAttribute("data-task-id");
      deleteTask(taskId);
      debouncedSearch(searchState.currentQuery);
    });
  });

  // Actualizar estadísticas
  if (updateStats) updateStats();
}

// Función para renderizar notas con filtro de búsqueda
function renderNotesWithFilter(filteredNotes) {
  const container = document.getElementById("notasGrid");
  if (!container) return;

  if (filteredNotes.length === 0) {
    if (searchState.currentQuery.trim()) {
      container.innerHTML = `<div class="no-results">No se encontraron notas que coincidan con "${searchState.currentQuery}"</div>`;
    } else {
      container.innerHTML = `<div class="no-notes">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <h3>No hay notas</h3>
        <p>Crea tu primera nota haciendo clic en "Nueva Nota"</p>
      </div>`;
    }
    return;
  }

  container.innerHTML = filteredNotes
    .map((note) => {
      const noteHtml = renderNoteCard(note);
      return noteHtml;
    })
    .join("");

  // Agregar event listeners para eliminar notas
  container.querySelectorAll(".delete-note").forEach((button) => {
    button.addEventListener("click", (e) => {
      const noteId = e.target
        .closest("[data-note-id]")
        .getAttribute("data-note-id");
      deleteNote(noteId);
    });
  });
}

// Función para eliminar una nota
function deleteNote(noteId) {
  if (confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
    const notes = getNotes();
    const filteredNotes = notes.filter((note) => note.id !== noteId);
    saveNotes(filteredNotes);
    debouncedSearch(searchState.currentQuery);
  }
}

// Función auxiliar para resaltar texto coincidente
function highlightMatch(text, query) {
  if (!query.trim() || !text) return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(regex, "<mark>$1</mark>");
}

// Función para renderizar todas las notas
function renderNotes() {
  const container = document.getElementById("notasGrid");
  if (!container) return;

  const notes = getNotes();

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="no-notes">
        <div class="no-notes-icon">📝</div>
        <h3>No notes yet</h3>
        <p>Click "Nueva Nota" to create your first note</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map((note) => renderNoteCard(note)).join("");
}

// Función para renderizar una tarjeta de nota individual
function renderNoteCard(note) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString();

  switch (note.type) {
    case "standard":
      return `
        <div class="note-card" style="background-color: ${
          note.color
        }" data-note-id="${note.id}">
          <div class="note-header">
            <h3 class="note-title">${note.title}</h3>
            <div class="note-actions">
              <button class="note-action-btn edit-note" title="Edit">✏️</button>
              <button class="note-action-btn delete-note" title="Delete">🗑️</button>
            </div>
          </div>
          <div class="note-content">
            <p>${note.content || ""}</p>
          </div>
          <div class="note-footer">
            <div class="note-tags">${(note.specificData?.tags || [])
              .map((tag) => `<span class="note-tag">${tag}</span>`)
              .join("")}</div>
            <div class="note-date">${formattedDate}</div>
          </div>
        </div>
      `;

    case "checklist":
      const items = note.specificData?.items || [];
      const completed = items.filter((item) => item.checked).length;
      return `
        <div class="note-card checklist-card" style="background-color: ${
          note.color
        }" data-note-id="${note.id}">
          <div class="note-header">
            <h3 class="note-title">${note.title}</h3>
            <div class="checklist-progress">${completed}/${items.length}</div>
          </div>
          <div class="note-content">
            <div class="checklist-items">
              ${items
                .slice(0, 4)
                .map(
                  (item) => `
                <div class="checklist-item-preview ${
                  item.checked ? "checked" : ""
                }">
                  <span class="checkmark">${item.checked ? "✓" : "○"}</span>
                  <span class="item-text">${item.text}</span>
                </div>
              `
                )
                .join("")}
              ${
                items.length > 4
                  ? `<div class="more-items">+${
                      items.length - 4
                    } more items</div>`
                  : ""
              }
            </div>
          </div>
          <div class="note-footer">
            <div class="note-date">${formattedDate}</div>
          </div>
        </div>
      `;

    case "idea":
      return `
        <div class="note-card idea-card" style="background-color: ${
          note.color
        }" data-note-id="${note.id}">
          <div class="note-header">
            <h3 class="note-title">💡 ${note.title}</h3>
            <div class="idea-potential ${
              note.specificData?.potential || "medium"
            }">${note.specificData?.potential || "medium"}</div>
          </div>
          <div class="note-content">
            <p class="idea-description">${
              note.specificData?.description || ""
            }</p>
            ${
              note.specificData?.keyPoints
                ? `<div class="key-points">${note.specificData.keyPoints
                    .split("\\n")
                    .slice(0, 3)
                    .map((point) => `<div class="key-point">${point}</div>`)
                    .join("")}</div>`
                : ""
            }
          </div>
          <div class="note-footer">
            <div class="note-date">${formattedDate}</div>
          </div>
        </div>
      `;

    case "meeting":
      return `
        <div class="note-card meeting-card" style="background-color: ${
          note.color
        }" data-note-id="${note.id}">
          <div class="note-header">
            <h3 class="note-title">🗓️ ${note.title}</h3>
            ${
              note.specificData?.meetingDate
                ? `<div class="meeting-date">${new Date(
                    note.specificData.meetingDate
                  ).toLocaleDateString()}</div>`
                : ""
            }
          </div>
          <div class="note-content">
            ${
              note.specificData?.attendees
                ? `<div class="attendees">👥 ${note.specificData.attendees}</div>`
                : ""
            }
            ${
              note.specificData?.agenda
                ? `<div class="agenda-preview">${
                    note.specificData.agenda.split("\\n")[0]
                  }${
                    note.specificData.agenda.split("\\n").length > 1
                      ? "..."
                      : ""
                  }</div>`
                : ""
            }
          </div>
          <div class="note-footer">
            <div class="note-date">${formattedDate}</div>
          </div>
        </div>
      `;

    case "sticky":
      return `
        <div class="note-card sticky-card" style="background-color: ${note.color}" data-note-id="${note.id}">
          <div class="sticky-content">
            <p>${note.content}</p>
          </div>
          <div class="sticky-pin">📌</div>
        </div>
      `;

    default:
      return "";
  }
}

const btn = document.getElementById("addBtn");
const modal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const taskForm = document.getElementById("taskForm");

// Navegación entre secciones
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section-content");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remover clase active de todos los nav-items
    navItems.forEach((nav) => nav.classList.remove("active"));
    // Agregar clase active al nav-item clickeado
    item.classList.add("active");

    // Ocultar todas las secciones
    sections.forEach((section) => section.classList.remove("active"));

    // Mostrar la sección correspondiente
    const sectionId = item.dataset.section + "-section";
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");

      // Si es la sección de Tablas, renderizar la tabla
      if (sectionId === "tablas-section") {
        renderTasksTable();
      }

      // Si es la sección de Tareas (cards), renderizar tarjetas
      if (sectionId === "tareas-section") {
        renderTasks();
      }

      // Si es la sección de Notas, renderizar notas
      if (sectionId === "notas-section") {
        renderNotes();
      }

      // Si es la sección de Calendar, inicializar el calendario
      if (sectionId === "calendario-section") {
        // Dar tiempo para que el DOM se actualice
        setTimeout(() => {
          initCalendar();
        }, 100);
      }

      // Si es la sección de Dashboard, actualizar gráficas
      if (sectionId === "dashboard-section") {
        setTimeout(() => {
          updateCharts();
        }, 100);
      }
    }
  });
});

// Función para actualizar el header según la sección
function updateHeader(sectionId) {
  const header = document.querySelector(".header");
  const searchInput = document.querySelector(".search-bar input");
  const addActionBtn = document.getElementById("addBtn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const headerTitle = document.getElementById("headerTitle");
  const filterIconBtn = document.getElementById("filterIconBtn");

  if (header) {
    header.style.display = sectionId === "dashboard-section" ? "none" : "flex";
  }

  if (sectionId === "dashboard-section") {
    return;
  }

  // Resetear todos los filtros primero
  filterButtons.forEach((btn) => {
    btn.style.display = "inline-flex";
  });

  // Ocultar icono de filtro por defecto
  if (filterIconBtn) {
    filterIconBtn.style.display = "none";
  }

  // Actualizar título del header
  if (headerTitle) {
    switch (sectionId) {
      case "tablas-section":
        headerTitle.textContent = "Tablas";
        break;
      case "tareas-section":
        headerTitle.textContent = "Tareas";
        break;
      case "calendario-section":
        headerTitle.textContent = "Calendario";
        break;
      case "dashboard-section":
        headerTitle.textContent = "Dashboard";
        break;
      default:
        headerTitle.textContent = "TaskMaster";
    }
  }

  switch (sectionId) {
    case "tablas-section":
      searchInput.placeholder = "Buscar tareas...";
      addActionBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Añadir Tarea
      `;
      // Mantener los 3 filtros por defecto (All, Active, Completed)
      break;

    case "tareas-section":
      searchInput.placeholder = "Buscar tareas...";
      addActionBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Añadir Tarea
      `;
      // Mantener los 3 filtros por defecto (All, Active, Completed)
      break;

    case "calendario-section":
      searchInput.placeholder = "Buscar eventos...";
      addActionBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Evento
      `;
      // Ocultar todos los filtros en calendario
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    case "notas-section":
      searchInput.placeholder = "Buscar notas...";
      addActionBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nueva Nota
      `;
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

      if (filterIconBtn) {
        filterIconBtn.style.display = "flex";
      }
      break;

    default:
      searchInput.placeholder = "Buscar...";
      addActionBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Agregar
      `;
      filterButtons.forEach((btn) => (btn.style.display = "none"));
  }
}

// IMPORTANTE: Llamar updateHeader cuando cambias de sección
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    sections.forEach((section) => section.classList.remove("active"));

    const sectionId = item.dataset.section + "-section";
    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
      targetSection.classList.add("active");

      // ✅ Actualizar el header
      updateHeader(sectionId);

      // Renderizar contenido específico
      if (sectionId === "tablas-section") {
        renderTasksTable();
      }

      if (sectionId === "tareas-section") {
        renderTasks();
      }

      if (sectionId === "calendario-section") {
        setTimeout(() => {
          initCalendar();
        }, 100);
      }

      if (sectionId === "dashboard-section") {
        setTimeout(() => {
          updateCharts();
        }, 100);
      }
    }
  });
});

// Filtrar entre estados
const filterItems = document.querySelectorAll(".filter-btn");

filterItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remover el atributo active de los button filter
    filterItems.forEach((button) => button.classList.remove("active"));
    // Agregar clase activa al boton clickeado
    item.classList.add("active");

    // Determinar qué sección está activa y renderizar apropiadamente
    const activeSection = document.querySelector(".section-content.active");
    if (activeSection) {
      if (activeSection.id === "tablas-section") {
        renderTasksTable();
      } else if (activeSection.id === "tareas-section") {
        renderTasks();
      }
    }
  });
});

// Cerrar modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  taskForm.reset();
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  taskForm.reset();
});

// Cerrar modal al hacer clic fuera de él
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    taskForm.reset();
  }
});

// Enviar formulario
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(taskForm);
  const title = formData.get("title");
  const description = formData.get("description") || "";
  const priority = formData.get("priority");
  const date = formData.get("date") || "";

  if (title.trim() === "") return;

  // Crear objeto de tarea con toda la información
  const taskData = {
    text: title,
    description,
    priority,
    date,
  };

  addTask(taskData);
  modal.style.display = "none";
  taskForm.reset();

  // Determinar qué sección está activa y renderizar apropiadamente
  const activeSection = document.querySelector(".section-content.active");
  if (activeSection) {
    if (activeSection.id === "tareas-section") {
      renderTasksTable();
    } else if (activeSection.id === "tablas-section") {
      renderTasks();
    } else if (activeSection.id === "calendario-section") {
      updateCalendarEvents();
    } else if (activeSection.id === "dashboard-section") {
      updateCharts();
    }
  }

  updateStats();
});

// Funcionalidad del carrusel
function initCarousel() {
  const container = document.getElementById("tasksContainer");
  const leftArrow = document.getElementById("carouselLeft");
  const rightArrow = document.getElementById("carouselRight");

  if (!container || !leftArrow || !rightArrow) return;

  function updateArrowStates() {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const canScroll = scrollWidth > clientWidth;

    // Si no hay suficiente contenido para hacer scroll, ocultar ambas flechas
    if (!canScroll) {
      leftArrow.style.display = "none";
      rightArrow.style.display = "none";
      return;
    }

    // Mostrar las flechas si hay contenido para hacer scroll
    leftArrow.style.display = "flex";
    rightArrow.style.display = "flex";

    // Deshabilitar/habilitar flechas según la posición del scroll
    if (scrollLeft <= 5) {
      leftArrow.classList.add("disabled");
    } else {
      leftArrow.classList.remove("disabled");
    }

    if (scrollLeft >= scrollWidth - clientWidth - 5) {
      rightArrow.classList.add("disabled");
    } else {
      rightArrow.classList.remove("disabled");
    }
  }

  // Navegar hacia la izquierda
  leftArrow.addEventListener("click", () => {
    const cardWidth = 280 + 24; // ancho de tarjeta + gap
    container.scrollBy({
      left: -cardWidth * 2,
      behavior: "smooth",
    });
  });

  // Navegar hacia la derecha
  rightArrow.addEventListener("click", () => {
    const cardWidth = 280 + 24; // ancho de tarjeta + gap
    container.scrollBy({
      left: cardWidth * 2,
      behavior: "smooth",
    });
  });

  // Actualizar estado de las flechas al hacer scroll
  container.addEventListener("scroll", updateArrowStates);

  // Actualizar estado inicial
  updateArrowStates();

  // Actualizar cuando se renderizan las tareas
  const observer = new MutationObserver(() => {
    setTimeout(updateArrowStates, 100);
  });

  observer.observe(container, { childList: true, subtree: true });
}

// Inicialización
updateStats();
initCarousel();
initCharts();

// ============================================
// FUNCIONALIDAD DEL MODAL DE TIPOS DE NOTA
// ============================================

// Elementos del modal de tipos de nota
const noteTypeModal = document.getElementById("noteTypeModal");
const closeNoteTypeModal = document.getElementById("closeNoteTypeModal");
const cancelNoteType = document.getElementById("cancelNoteType");
const noteTypeOptions = document.querySelectorAll(".note-type-option");

// Función para abrir el modal de tipos de nota
function openNoteTypeModal() {
  noteTypeModal.style.display = "flex";
}

// Función para cerrar el modal de tipos de nota
function closeNoteTypeModalFunc() {
  noteTypeModal.style.display = "none";
}

// Event listeners para el modal de tipos de nota
closeNoteTypeModal?.addEventListener("click", closeNoteTypeModalFunc);
cancelNoteType?.addEventListener("click", closeNoteTypeModalFunc);

// Cerrar modal al hacer clic fuera
noteTypeModal?.addEventListener("click", (e) => {
  if (e.target === noteTypeModal) {
    closeNoteTypeModalFunc();
  }
});

// Manejar selección de tipo de nota
noteTypeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const noteType = option.dataset.type;
    console.log(`Tipo de nota seleccionado: ${noteType}`);

    // Cerrar modal de selección
    closeNoteTypeModalFunc();

    // Abrir modal específico según el tipo
    openSpecificNoteModal(noteType);
  });
});

// Función para abrir modal específico según el tipo de nota
function openSpecificNoteModal(noteType) {
  const modals = {
    standard: document.getElementById("standardNoteModal"),
    checklist: document.getElementById("checklistModal"),
    idea: document.getElementById("ideaModal"),
    meeting: document.getElementById("meetingModal"),
    sticky: document.getElementById("stickyModal"),
  };

  const modal = modals[noteType];
  if (modal) {
    modal.style.display = "flex";
  }
}

// ============================================
// FUNCIONALIDAD DE MODALES ESPECÍFICOS DE NOTA
// ============================================

// Standard Note Modal
const standardModal = document.getElementById("standardNoteModal");
const closeStandardNote = document.getElementById("closeStandardNote");
const cancelStandardNote = document.getElementById("cancelStandardNote");
const standardForm = document.getElementById("standardNoteForm");

closeStandardNote?.addEventListener(
  "click",
  () => (standardModal.style.display = "none")
);
cancelStandardNote?.addEventListener(
  "click",
  () => (standardModal.style.display = "none")
);
standardModal?.addEventListener("click", (e) => {
  if (e.target === standardModal) standardModal.style.display = "none";
});

// Event listener para guardar nota standard
standardForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const tags = document
    .getElementById("standardTags")
    .value.split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  createNote({
    type: "standard",
    title: document.getElementById("standardTitle").value,
    content: document.getElementById("standardContent").value,
    specificData: { tags },
  });

  standardModal.style.display = "none";
  e.target.reset();
});

// Checklist Modal
const checklistModal = document.getElementById("checklistModal");
const closeChecklist = document.getElementById("closeChecklist");
const cancelChecklist = document.getElementById("cancelChecklist");
const checklistForm = document.getElementById("checklistForm");

closeChecklist?.addEventListener(
  "click",
  () => (checklistModal.style.display = "none")
);
cancelChecklist?.addEventListener(
  "click",
  () => (checklistModal.style.display = "none")
);
checklistModal?.addEventListener("click", (e) => {
  if (e.target === checklistModal) checklistModal.style.display = "none";
});

// Event listener para guardar checklist
checklistForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const items = Array.from(document.querySelectorAll("#checklistItems input"))
    .map((input) => ({ text: input.value, checked: false }))
    .filter((item) => item.text.trim());

  createNote({
    type: "checklist",
    title: document.getElementById("checklistTitle").value,
    specificData: { items },
  });

  checklistModal.style.display = "none";
  e.target.reset();
  // Resetear items a uno solo
  document.getElementById("checklistItems").innerHTML = `
    <div class="checklist-item">
      <input type="text" placeholder="First item..." required>
      <button type="button" class="remove-item">&times;</button>
    </div>
  `;
});

const addChecklistItem = document.getElementById("addChecklistItem");

// Función para agregar item a checklist
addChecklistItem?.addEventListener("click", () => {
  const container = document.getElementById("checklistItems");
  const newItem = document.createElement("div");
  newItem.className = "checklist-item";
  newItem.innerHTML = `
    <input type="text" placeholder="New item..." required>
    <button type="button" class="remove-item">&times;</button>
  `;

  // Agregar funcionalidad de eliminar
  const removeBtn = newItem.querySelector(".remove-item");
  removeBtn.addEventListener("click", () => newItem.remove());

  container.appendChild(newItem);
});

// Idea Modal
const ideaModal = document.getElementById("ideaModal");
const closeIdea = document.getElementById("closeIdea");
const cancelIdea = document.getElementById("cancelIdea");
const ideaForm = document.getElementById("ideaForm");

closeIdea?.addEventListener("click", () => (ideaModal.style.display = "none"));
cancelIdea?.addEventListener("click", () => (ideaModal.style.display = "none"));
ideaModal?.addEventListener("click", (e) => {
  if (e.target === ideaModal) ideaModal.style.display = "none";
});

// Event listener para guardar idea
ideaForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  createNote({
    type: "idea",
    title: document.getElementById("ideaTitle").value,
    specificData: {
      description: document.getElementById("ideaDescription").value,
      keyPoints: document.getElementById("ideaKeyPoints").value,
      potential: document.getElementById("ideaPotential").value,
    },
  });

  ideaModal.style.display = "none";
  e.target.reset();
});

// Meeting Modal
const meetingModal = document.getElementById("meetingModal");
const closeMeeting = document.getElementById("closeMeeting");
const cancelMeeting = document.getElementById("cancelMeeting");
const meetingForm = document.getElementById("meetingForm");

closeMeeting?.addEventListener(
  "click",
  () => (meetingModal.style.display = "none")
);
cancelMeeting?.addEventListener(
  "click",
  () => (meetingModal.style.display = "none")
);
meetingModal?.addEventListener("click", (e) => {
  if (e.target === meetingModal) meetingModal.style.display = "none";
});

// Event listener para guardar meeting note
meetingForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  createNote({
    type: "meeting",
    title: document.getElementById("meetingTitle").value,
    specificData: {
      meetingDate: document.getElementById("meetingDate").value,
      attendees: document.getElementById("meetingAttendees").value,
      agenda: document.getElementById("meetingAgenda").value,
      notes: document.getElementById("meetingNotes").value,
      actionItems: document.getElementById("meetingActions").value,
    },
  });

  meetingModal.style.display = "none";
  e.target.reset();
});

closeMeeting?.addEventListener(
  "click",
  () => (meetingModal.style.display = "none")
);
cancelMeeting?.addEventListener(
  "click",
  () => (meetingModal.style.display = "none")
);
meetingModal?.addEventListener("click", (e) => {
  if (e.target === meetingModal) meetingModal.style.display = "none";
});

// Sticky Note Modal
const stickyModal = document.getElementById("stickyModal");
const closeSticky = document.getElementById("closeSticky");
const cancelSticky = document.getElementById("cancelSticky");
const stickyForm = document.getElementById("stickyForm");
const stickyContent = document.getElementById("stickyContent");
const charCounter = document.querySelector(".char-counter");

closeSticky?.addEventListener(
  "click",
  () => (stickyModal.style.display = "none")
);
cancelSticky?.addEventListener(
  "click",
  () => (stickyModal.style.display = "none")
);
stickyModal?.addEventListener("click", (e) => {
  if (e.target === stickyModal) stickyModal.style.display = "none";
});

// Event listener para guardar sticky note
stickyForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedColor = document.querySelector(
    'input[name="stickyColor"]:checked'
  ).value;
  const colorMap = {
    yellow: "#fef3c7",
    pink: "#fce7f3",
    blue: "#dbeafe",
    green: "#d1fae5",
  };

  createNote({
    type: "sticky",
    title: "", // Sticky notes don't have titles
    content: document.getElementById("stickyContent").value,
    color: colorMap[selectedColor] || "#fef3c7",
  });

  stickyModal.style.display = "none";
  e.target.reset();
  // Reset char counter
  charCounter.textContent = "0 / 200 characters";
  charCounter.style.color = "#9ca3af";
});

// Contador de caracteres para sticky note
stickyContent?.addEventListener("input", (e) => {
  const current = e.target.value.length;
  const max = 200;
  charCounter.textContent = `${current} / ${max} characters`;

  if (current > max * 0.8) {
    charCounter.style.color = "#ef4444";
  } else {
    charCounter.style.color = "#9ca3af";
  }
});

// Event listener para botones de eliminar item existentes en checklist
document.querySelectorAll(".remove-item").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.target.closest(".checklist-item").remove();
  });
});

// Modificar el event listener del botón addActionBtn para abrir modal de notas cuando esté en sección notas
btn.addEventListener("click", () => {
  // Verificar en qué sección estamos
  const activeSection = document.querySelector(".section-content.active");
  if (activeSection && activeSection.id === "notas-section") {
    // Estamos en la sección de notas, abrir modal de tipos
    openNoteTypeModal();
  } else {
    // Otras secciones, abrir modal de tarea normal
    modal.style.display = "flex";
  }
});

// Renderizar la vista activa al cargar
const tablasSection = document.getElementById("tablas-section");
if (tablasSection && tablasSection.classList.contains("active")) {
  renderTasksTable();
}

const tareasSection = document.getElementById("tareas-section");
if (tareasSection && tareasSection.classList.contains("active")) {
  renderTasks();
}

// Renderizar notas si la sección está activa al cargar
const notasSection = document.getElementById("notas-section");
if (notasSection && notasSection.classList.contains("active")) {
  renderNotes();
}

// ============================================
// CONFIGURACIÓN DE BÚSQUEDA CON DEBOUNCE
// ============================================

// Obtener el input de búsqueda y configurar eventos
const searchInput = document.querySelector(".search-bar input");

if (searchInput) {
  // Event listener para búsqueda con debounce
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    debouncedSearch(query);
  });

  // Limpiar búsqueda cuando se hace clic en el icono de búsqueda (opcional)
  const searchIcon = document.querySelector(".search-bar svg");
  if (searchIcon) {
    searchIcon.addEventListener("click", () => {
      if (searchInput.value.trim()) {
        searchInput.value = "";
        debouncedSearch("");
      }
    });
  }

  // Limpiar búsqueda al presionar Escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      debouncedSearch("");
      searchInput.blur();
    }
  });
}

// Actualizar estado de búsqueda cuando se cambia de sección
const originalNavClickHandler = navItems.forEach;
navItems.forEach((item) => {
  const existingHandler = item.onclick;
  item.addEventListener("click", () => {
    // Limpiar búsqueda al cambiar de sección
    if (searchInput) {
      searchInput.value = "";
      searchState.currentQuery = "";
    }

    // Actualizar sección actual
    const sectionId = item.dataset.section + "-section";
    searchState.currentSection = sectionId;
  });
});

// Funciones auxiliares para integración con el sistema existente
window.searchFunctions = {
  performSearch,
  clearSearch: () => {
    if (searchInput) {
      searchInput.value = "";
      searchState.currentQuery = "";
      performSearch("");
    }
  },
  getCurrentQuery: () => searchState.currentQuery,
};

console.log("TaskMaster inicializado correctamente");
