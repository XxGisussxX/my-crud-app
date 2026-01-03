/**
 * Constants Module
 * Shared constants and configuration
 */

// ============================================
// UI CONSTANTS
// ============================================

export const CSS_CLASSES = {
  ACTIVE: "active",
  COMPLETED: "completed",
  OPEN: "open",
  HIDDEN: "hidden",
  SHOW: "show",
};

export const PRIORITIES = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  DONE: "done",
};

export const PRIORITY_LABELS = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
  done: "Completada",
};

export const NOTE_TYPES = {
  STANDARD: "standard",
  CHECKLIST: "checklist",
  IDEA: "idea",
  MEETING: "meeting",
  STICKY: "sticky",
};

export const STICKY_COLORS = {
  YELLOW: "yellow",
  PINK: "pink",
  BLUE: "blue",
  GREEN: "green",
};

// ============================================
// SELECTORS
// ============================================

export const SELECTORS = {
  // Main sections
  HEADER: ".header",
  SIDEBAR: ".sidebar",
  MAIN_CONTENT: ".main-content",

  // Task elements
  TASK_LIST: "#taskList",
  TASK_GRID: ".tasks-grid",
  TASK_INPUT: "#taskInput",
  TASK_DESC_INPUT: "#taskDesc",
  PRIORITY_SELECT: "#priority",
  DATE_INPUT: "#date",

  // Stats
  COMPLETED_STAT: "#tasksCompleted",
  ACTIVE_STAT: "#activeTasks",

  // Notes
  NOTES_GRID: "#notasGrid",

  // Modals
  MODAL_TASK: "#taskModal",
  MODAL_NOTES: "#noteTypeModal",
  MODAL_CONFIRMATION: "#confirmationModal",

  // Buttons
  BTN_ADD_TASK: ".add-task-btn",
  BTN_FILTER: ".filter-btn",
  BTN_CLOSE: ".close-modal",

  // Calendar
  CALENDAR: "#calendario",
};

// ============================================
// MESSAGES
// ============================================

export const MESSAGES = {
  DELETE_TASK: "¿Está seguro de que desea eliminar esta tarea?",
  DELETE_NOTE: "¿Está seguro de que desea eliminar esta nota?",
  CLEAR_ALL: "¿Está seguro de que desea eliminar todas las tareas?",
  TASK_ADDED: "Tarea agregada",
  TASK_DELETED: "Tarea eliminada",
  TASK_COMPLETED: "Tarea completada",
  NOTE_ADDED: "Nota agregada",
  NOTE_DELETED: "Nota eliminada",
};

// ============================================
// ANIMATION TIMING
// ============================================

export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// ============================================
// DATE FORMATS
// ============================================

export const DATE_FORMATS = {
  ISO_DATE: "YYYY-MM-DD",
  SHORT: { year: "numeric", month: "short", day: "numeric" },
  LONG: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
  TIME: { hour: "2-digit", minute: "2-digit" },
};
