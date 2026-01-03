/**
 * Filters Module
 * Handles filter functionality for tasks
 */

import { renderTasks, renderTasksTable } from "../tasks/index.js";

/**
 * Initialize filter buttons
 */
export function initFilters() {
  const filterItems = document.querySelectorAll(".filter-btn");

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      filterItems.forEach((button) => button.classList.remove("active"));
      item.classList.add("active");

      // Re-render according to active section
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

/**
 * Get current active filter
 */
export function getActiveFilter() {
  const activeFilter = document.querySelector(".filter-btn.active");
  return activeFilter ? activeFilter.dataset.filter : "todas";
}
