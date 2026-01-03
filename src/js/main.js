// Tasks Module
import { addTask, toggleTask, deleteTask } from "./tasks/index.js";
import {
  renderTasks,
  updateStats,
  renderTasksTable,
  searchTasks,
} from "./tasks/index.js";

// Notes Module
import * as NotesLogic from "./notes/logic.js";
import * as NotesUI from "./notes/ui.js";

// Dashboard Module
import {
  initCharts,
  updateCharts,
  updateDashboardStats,
  destroyCharts,
} from "./dashboard/index.js";
import {
  initCalendar,
  updateCalendarEvents,
  destroyCalendar,
} from "./dashboard/index.js";
import { initHeatmap, updateHeatmap } from "./dashboard/index.js";

// UI Module
import {
  openNoteTypeModal,
  initNoteModals,
  initModals,
  openSpecificNoteModal,
  editNote as editNoteUI
} from "./ui/index.js";
import { initNavigation, initDrawer, updateHeader } from "./ui/index.js";
import { initSearch, clearSearchHighlights } from "./ui/index.js";
import { initFilters } from "./ui/index.js";

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

// ============================================
// UI FUNCTIONS MOVED TO MODULES
// See: src/js/ui/navigation.js, search.js, filters.js, modals.js
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
  initSearch();

  // Inicializar charts
  initCharts();

  // Renderizar contenido inicial
  renderTasks();
  updateStats();

  console.log("TaskMaster inicializado correctamente");
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initApp);

