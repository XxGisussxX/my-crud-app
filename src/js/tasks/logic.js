/**
 * Tasks Logic Module
 * Core business logic for task management
 */

import { getTasks, saveTasks } from "../shared/storage.js";
import { generateId, formatDateISO } from "../shared/utils.js";

/**
 * Create a new task
 */
export function createTask(taskData) {
  const tasks = getTasks();
  const newTask = {
    id: generateId(),
    text: taskData.text,
    description: taskData.description || "",
    priority: taskData.priority || "medium",
    date: taskData.date || "",
    createdAt: formatDateISO(new Date()),
    completed: false,
    completedAt: null,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

// Alias for backwards compatibility
export const addTask = createTask;

/**
 * Update an existing task
 */
export function updateTask(id, updates) {
  const tasks = getTasks();
  const updated = tasks.map((task) =>
    task.id === id ? { ...task, ...updates } : task
  );
  saveTasks(updated);
  return updated.find((t) => t.id === id);
}

/**
 * Toggle task completion status
 */
export function toggleTask(id) {
  const tasks = getTasks();
  const updated = tasks.map((t) => {
    if (t.id === id) {
      const isCompleted = !t.completed;
      return {
        ...t,
        completed: isCompleted,
        completedAt: isCompleted ? formatDateISO(new Date()) : null,
      };
    }
    return t;
  });
  saveTasks(updated);
  return updated.find((t) => t.id === id);
}

/**
 * Delete a task
 */
export function deleteTask(id) {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  saveTasks(filtered);
  return filtered;
}

/**
 * Get task by ID
 */
export function getTaskById(id) {
  const tasks = getTasks();
  return tasks.find((t) => t.id === id);
}

/**
 * Get all tasks
 */
export function getAllTasks() {
  return getTasks();
}

/**
 * Get filtered tasks
 */
export function getFilteredTasks(filter = "all") {
  const tasks = getTasks();

  switch (filter.toLowerCase()) {
    case "active":
      return tasks.filter((t) => !t.completed);
    case "completed":
      return tasks.filter((t) => t.completed);
    default:
      return tasks;
  }
}

/**
 * Get tasks with combined filters (status + priority)
 */
export function getTasksWithFilters(
  statusFilter = "all",
  priorityFilter = null
) {
  let tasks = getTasks();

  // Apply status filter
  switch (statusFilter.toLowerCase()) {
    case "active":
      tasks = tasks.filter((t) => !t.completed);
      break;
    case "completed":
      tasks = tasks.filter((t) => t.completed);
      break;
    default:
      break;
  }

  // Apply priority filter if specified
  if (priorityFilter && priorityFilter !== "all") {
    tasks = tasks.filter((t) => t.priority === priorityFilter);
  }

  // Sort by date (ascending - most recent first)
  tasks = tasks.sort((a, b) => {
    // If both have dates, sort by date
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    // Items with dates come before items without dates
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    // If neither have dates, maintain original order
    return 0;
  });

  return tasks;
}

/**
 * Get task statistics
 */
export function getTaskStats() {
  const tasks = getTasks();
  const completed = tasks.filter((t) => t.completed).length;
  const active = tasks.filter((t) => !t.completed).length;

  return {
    total: tasks.length,
    completed,
    active,
    completionRate:
      tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

/**
 * Get tasks by priority
 */
export function getTasksByPriority(priority) {
  const tasks = getTasks();
  return tasks.filter((t) => t.priority === priority);
}

/**
 * Get tasks by date
 */
export function getTasksByDate(date) {
  const tasks = getTasks();
  return tasks.filter((t) => t.date === date);
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks() {
  const today = formatDateISO(new Date());
  const tasks = getTasks();
  return tasks.filter((t) => !t.completed && t.date && t.date < today);
}

/**
 * Sort tasks
 */
export function sortTasks(tasks, sortBy = "date") {
  const sorted = [...tasks];

  switch (sortBy) {
    case "priority":
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    case "date":
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    case "created":
      return sorted.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case "completed":
      return sorted.sort((a, b) => a.completed - b.completed);
    default:
      return sorted;
  }
}

/**
 * Search tasks
 */
export function searchTasks(query) {
  const tasks = getTasks();
  const lowerQuery = query.toLowerCase();
  return tasks.filter(
    (t) =>
      t.text.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Clear all tasks
 */
export function clearAllTasks() {
  saveTasks([]);
}

/**
 * Export tasks data
 */
export function exportTasks() {
  return JSON.stringify(getTasks(), null, 2);
}

/**
 * Import tasks data
 */
export function importTasks(jsonData) {
  try {
    const tasks = JSON.parse(jsonData);
    if (Array.isArray(tasks)) {
      saveTasks(tasks);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error importing tasks:", error);
    return false;
  }
}
