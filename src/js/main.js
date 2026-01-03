// Tasks Module
import { addTask, toggleTask, deleteTask } from "./tasks/index.js";
import { renderTasks, updateStats, renderTasksTable, searchTasks } from "./tasks/index.js";

// Notes Module
import * as NotesLogic from "./notes/logic.js";
import * as NotesUI from "./notes/ui.js";

// Dashboard Module
import { initCharts, updateCharts, updateDashboardStats, destroyCharts } from "./dashboard/index.js";
import { initCalendar, updateCalendarEvents, destroyCalendar } from "./dashboard/index.js";
import { initHeatmap, updateHeatmap } from "./dashboard/index.js";

// UI Module
import { 
  openNoteTypeModal, 
  initNoteModals, 
  openSpecificNoteModal,
  editNote as editNoteUI
} from "./ui/index.js";

// Shared Module
import { getTasks, saveTasks } from "./shared/storage.js";
import { showConfirmation } from "./confirmation.js";

// Make functions globally available for compatibility
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

// Notes functions
window.createNote = NotesLogic.createNote;
window.updateNote = NotesLogic.updateNote;
window.deleteNote = NotesLogic.deleteNote;
window.getNotes = NotesLogic.getAllNotes;
window.renderNotes = NotesUI.renderNotes;
window.searchNotes = NotesUI.searchAndRenderNotes;
window.deleteNoteWithConfirmation = NotesUI.deleteNoteWithConfirmation;
window.editNote = editNoteUI;
window.openNoteTypeModal = openNoteTypeModal;
window.initNoteModals = initNoteModals;


// ============================================
// NOTES FUNCTIONS MOVED TO MODULES
// See: src/js/notes/logic.js and src/js/notes/ui.js
// ============================================


      const noteId = noteCard.dataset.noteId;
      if (!noteId) return;

      // Manejar clicks en botones de acción
      if (e.target.classList.contains("edit-note")) {
        editNote(noteId);
      } else if (e.target.classList.contains("delete-note")) {
        deleteNoteWithConfirmation(noteId);
      }
      // Manejar clicks en items de checklist
      else if (e.target.closest(".checklist-item-preview")) {
        const itemPreview = e.target.closest(".checklist-item-preview");
        const itemIndex = parseInt(itemPreview.dataset.itemIndex);
        if (!isNaN(itemIndex)) {
          toggleChecklistItem(noteId, itemIndex);
        }
      }
    });
    container.dataset.listenerAdded = "true";
  }
}


// RENDER NOTE CARD MOVED TO: src/js/notes/ui.js

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

// Funcionalidad de búsqueda
function initSearch() {
  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) return;

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    // Añadir indicador de búsqueda
    const searchBar = document.querySelector(".search-bar");
    searchBar.classList.add("searching");

    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();
      performSearch(query);
      searchBar.classList.remove("searching");
    }, 300);
  });
}

function performSearch(query) {
  const activeSection = document.querySelector(".section-content.active");
  if (!activeSection) return;

  switch (activeSection.id) {
    case "tareas-section":
      searchTasks(query);
      break;
    case "tablas-section":
      searchTasksTable(query);
      break;
    case "notas-section":
      searchNotes(query);
      break;
    default:
      break;
  }
}

function searchTasks(query) {
  const taskCards = document.querySelectorAll(".task-card");

  taskCards.forEach((card) => {
    const title =
      card.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const description =
      card.querySelector(".task-description")?.textContent.toLowerCase() || "";

    if (query === "" || title.includes(query) || description.includes(query)) {
      card.style.display = "block";
      highlightSearchTerm(card, query);
    } else {
      card.style.display = "none";
    }
  });
}

function searchTasksTable(query) {
  const rows = document.querySelectorAll("#tasksTableBody tr");

  rows.forEach((row) => {
    if (row.querySelector("td[colspan]")) return; // Skip "no tasks" row

    const title = row.cells[1]?.textContent.toLowerCase() || "";
    const description = row.cells[2]?.textContent.toLowerCase() || "";

    if (query === "" || title.includes(query) || description.includes(query)) {
      row.style.display = "";
      highlightSearchTerm(row, query);
    } else {
      row.style.display = "none";
    }
  });
}


function searchNotes(query) {
  // Delegate to NotesUI module
  NotesUI.searchAndRenderNotes(query);
}

function highlightSearchTerm(element, query) {
  if (!query) {
    // Remove existing highlights
    element.querySelectorAll("mark").forEach((mark) => {
      mark.outerHTML = mark.innerHTML;
    });
    return;
  }

  const textNodes = getTextNodes(element);
  textNodes.forEach((node) => {
    const text = node.textContent;
    const regex = new RegExp(`(${query})`, "gi");
    if (regex.test(text)) {
      const highlightedHTML = text.replace(regex, "<mark>$1</mark>");
      const wrapper = document.createElement("span");
      wrapper.innerHTML = highlightedHTML;
      node.parentNode.replaceChild(wrapper, node);
    }
  });
}

function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.parentNode.tagName !== "MARK") {
      textNodes.push(node);
    }
  }

  return textNodes;
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

  // Limpiar búsqueda anterior
  if (searchInput) {
    searchInput.value = "";
  }
  clearSearchHighlights();

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

function clearSearchHighlights() {
  document.querySelectorAll("mark").forEach((mark) => {
    mark.outerHTML = mark.innerHTML;
  });

  // Mostrar todos los elementos ocultos por búsqueda
  document
    .querySelectorAll(".task-card, #tasksTableBody tr, .note-card")
    .forEach((element) => {
      element.style.display = "";
    });
}

// ============================================
// FUNCIONES DE NOTAS MODALES
// ============================================


// ============================================
// NOTE MODALS AND FUNCTIONS MOVED TO MODULES
// See: src/js/ui/modals.js and src/js/notes/logic.js & ui.js
// ============================================

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
