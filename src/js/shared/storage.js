/**
 * Storage Module
 * Centralized localStorage management for tasks and notes
 */

// ============================================
// TASKS STORAGE
// ============================================

export function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

export function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ============================================
// NOTES STORAGE
// ============================================

export function getNotes() {
  const notes = localStorage.getItem("notes");
  return notes ? JSON.parse(notes) : [];
}

export function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// ============================================
// GENERIC STORAGE
// ============================================

export function getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

export function clearStorage() {
  localStorage.clear();
}
