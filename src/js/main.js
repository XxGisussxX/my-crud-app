import { addTask, toggleTask, deleteTask } from "./logic.js";
import { renderTasks, updateStats, renderTasksTable } from "./ui.js";
import { initCharts, updateCharts } from "./charts.js";
import { initCalendar, updateCalendarEvents } from "./calendar.js";
import { getTasks, saveTasks } from "./storage.js";
import { showConfirmation } from "./confirmation.js";

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
window.initCalendar = initCalendar;
window.updateCalendarEvents = updateCalendarEvents;

// ============================================
// FUNCIONES DE NOTAS
// ============================================

function getNotes() {
  const notes = localStorage.getItem("notes");
  return notes ? JSON.parse(notes) : [];
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

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
    ...noteData.specificData,
  };
  notes.push(newNote);
  saveNotes(notes);
  renderNotes();
  return newNote;
}

function getDefaultColor(type) {
  const colors = {
    standard: "#fef3c7",
    checklist: "#d1fae5",
    idea: "#fce7f3",
    meeting: "#dbeafe",
    sticky: "#fef3c7",
  };
  return colors[type] || "#ffffff";
}

function renderNotes() {
  const container = document.getElementById("notasGrid");
  if (!container) return;

  const notes = getNotes();
  if (notes.length === 0) {
    container.innerHTML = ``;
    return;
  }

  container.innerHTML = notes.map((note) => renderNoteCard(note)).join("");
}

function renderNoteCard(note) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString();

  switch (note.type) {
    case "standard":
      return `<div class="note-card" style="background-color: ${
        note.color
      }" data-note-id="${note.id}">
        <div class="note-header">
          <h3 class="note-title">${note.title}</h3>
          <div class="note-actions">
            <button class="note-action-btn edit-note" title="Edit">✏️</button>
            <button class="note-action-btn delete-note" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="note-content"><p>${note.content || ""}</p></div>
        <div class="note-footer">
          <div class="note-tags">${(note.specificData?.tags || [])
            .map((tag) => `<span class="note-tag">${tag}</span>`)
            .join("")}</div>
          <div class="note-date">${formattedDate}</div>
        </div>
      </div>`;

    case "sticky":
      return `<div class="note-card sticky-card" style="background-color: ${note.color}" data-note-id="${note.id}">
        <div class="sticky-content"><p>${note.content}</p></div>
        <div class="sticky-pin">📌</div>
      </div>`;

    default:
      return "";
  }
}

// ============================================
// NAVEGACIÓN Y UI
// ============================================

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Limpiar clases activas
      document
        .querySelectorAll(".nav-item")
        .forEach((nav) => nav.classList.remove("active"));
      document
        .querySelectorAll(".section-content")
        .forEach((section) => section.classList.remove("active"));

      // Activar elementos seleccionados
      item.classList.add("active");
      const sectionId = item.dataset.section + "-section";
      const targetSection = document.getElementById(sectionId);

      if (targetSection) {
        targetSection.classList.add("active");

        // Renderizar contenido según sección
        switch (item.dataset.section) {
          case "tareas":
            renderTasks();
            updateStats();
            break;
          case "tablas":
            renderTasksTable();
            break;
          case "dashboard":
            updateCharts();
            break;
          case "calendario":
            initCalendar();
            updateCalendarEvents();
            break;
          case "notas":
            renderNotes();
            break;
        }

        updateHeader(sectionId);
      }
    });
  });
}

function initFilters() {
  const filterItems = document.querySelectorAll(".filter-btn");

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      filterItems.forEach((button) => button.classList.remove("active"));
      item.classList.add("active");

      // Re-renderizar según sección activa
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
}

function initModals() {
  const modal = document.getElementById("taskModal");
  const addBtn = document.getElementById("addBtn");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const taskForm = document.getElementById("taskForm");

  // Botón agregar
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const activeSection = document.querySelector(".section-content.active");
      if (activeSection && activeSection.id === "notas-section") {
        openNoteTypeModal();
      } else {
        modal.style.display = "flex";
      }
    });
  }

  // Cerrar modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
      if (taskForm) taskForm.reset();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      if (taskForm) taskForm.reset();
    });
  }

  // Cerrar al hacer clic fuera
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        if (taskForm) taskForm.reset();
      }
    });
  }

  // Submit del formulario
  if (taskForm) {
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(taskForm);
      const taskData = {
        text: formData.get("title"),
        description: formData.get("description") || "",
        priority: formData.get("priority"),
        date: formData.get("date") || "",
      };

      if (taskData.text.trim() === "") return;

      addTask(taskData);

      // Re-renderizar
      const activeSection = document.querySelector(".section-content.active");
      if (activeSection) {
        if (activeSection.id === "tareas-section") {
          renderTasks();
        } else if (activeSection.id === "tablas-section") {
          renderTasksTable();
        }
      }

      updateStats();
      updateCharts();

      taskForm.reset();
      modal.style.display = "none";
    });
  }
}

function initDrawer() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!hamburgerBtn || !sidebar || !overlay) return;

  function toggleDrawer() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
  }

  hamburgerBtn.addEventListener("click", toggleDrawer);
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    hamburgerBtn.classList.remove("active");
  });

  // Cerrar drawer en móvil al seleccionar navegación
  const navItems = sidebar.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        setTimeout(() => {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
          hamburgerBtn.classList.remove("active");
        }, 150);
      }
    });
  });
}

function updateHeader(sectionId) {
  const searchInput = document.querySelector(".search-bar input");
  const addActionBtn = document.getElementById("addBtn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const header = document.querySelector(".header");

  // Resetear filtros
  filterButtons.forEach((btn) => {
    btn.style.display = "inline-flex";
  });

  switch (sectionId) {
    case "dashboard-section":
      // Ocultar header completo en dashboard
      if (header) header.style.display = "none";
      break;

    case "tablas-section":
    case "tareas-section":
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar tareas...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Añadir Tarea";
      }
      break;

    case "calendario-section":
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar eventos...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nuevo Evento";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    case "notas-section":
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar notas...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nueva Nota";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    default:
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Agregar";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
  }
}

// ============================================
// FUNCIONES DE NOTAS MODALES
// ============================================

function openNoteTypeModal() {
  const modal = document.getElementById("noteTypeModal");
  if (modal) modal.style.display = "flex";
}

function initNoteModals() {
  // Note Type Modal
  const noteTypeModal = document.getElementById("noteTypeModal");
  const closeNoteTypeModal = document.getElementById("closeNoteTypeModal");
  const cancelNoteType = document.getElementById("cancelNoteType");
  const noteTypeOptions = document.querySelectorAll(".note-type-option");

  function closeNoteTypeModalFunc() {
    if (noteTypeModal) noteTypeModal.style.display = "none";
  }

  if (closeNoteTypeModal)
    closeNoteTypeModal.addEventListener("click", closeNoteTypeModalFunc);
  if (cancelNoteType)
    cancelNoteType.addEventListener("click", closeNoteTypeModalFunc);
  if (noteTypeModal) {
    noteTypeModal.addEventListener("click", (e) => {
      if (e.target === noteTypeModal) closeNoteTypeModalFunc();
    });
  }

  noteTypeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const noteType = option.dataset.type;
      closeNoteTypeModalFunc();
      openSpecificNoteModal(noteType);
    });
  });

  // Standard Note Modal
  const standardModal = document.getElementById("standardNoteModal");
  const standardForm = document.getElementById("standardNoteForm");

  if (standardForm) {
    standardForm.addEventListener("submit", (e) => {
      e.preventDefault();
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

      if (standardModal) standardModal.style.display = "none";
      e.target.reset();
    });
  }

  // Sticky Note Modal
  const stickyModal = document.getElementById("stickyModal");
  const stickyForm = document.getElementById("stickyForm");

  if (stickyForm) {
    stickyForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const selectedColor =
        document.querySelector('input[name="stickyColor"]:checked')?.value ||
        "yellow";
      const colorMap = {
        yellow: "#fef3c7",
        pink: "#fce7f3",
        blue: "#dbeafe",
        green: "#d1fae5",
      };

      createNote({
        type: "sticky",
        title: "",
        content: document.getElementById("stickyContent").value,
        color: colorMap[selectedColor] || "#fef3c7",
      });

      if (stickyModal) stickyModal.style.display = "none";
      e.target.reset();
    });
  }
}

function openSpecificNoteModal(noteType) {
  const modals = {
    standard: document.getElementById("standardNoteModal"),
    sticky: document.getElementById("stickyModal"),
  };

  const modal = modals[noteType];
  if (modal) modal.style.display = "flex";
}

// ============================================
// INICIALIZACIÓN
// ============================================

function initApp() {
  console.log("Iniciando TaskMaster...");

  // Inicializar componentes
  initNavigation();
  initFilters();
  initModals();
  initDrawer();
  initNoteModals();

  // Inicializar charts
  initCharts();

  // Renderizar contenido inicial
  renderTasks();
  updateStats();

  console.log("TaskMaster inicializado correctamente");
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initApp);
