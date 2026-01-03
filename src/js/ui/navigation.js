/**
 * Navigation Module
 * Handles navigation between sections and header updates
 */

import { renderTasks, updateStats, renderTasksTable } from "../tasks/index.js";
import { renderNotes } from "../notes/ui.js";
import {
  initCalendar,
  updateCalendarEvents,
  updateCharts,
  initHeatmap,
} from "../dashboard/index.js";
import { clearSearchHighlights } from "./search.js";

/**
 * Initialize navigation system
 */
export function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Clear active classes
      document
        .querySelectorAll(".nav-item")
        .forEach((nav) => nav.classList.remove("active"));
      document
        .querySelectorAll(".section-content")
        .forEach((section) => section.classList.remove("active"));

      // Activate selected elements
      item.classList.add("active");
      const sectionId = item.dataset.section + "-section";
      const targetSection = document.getElementById(sectionId);

      if (targetSection) {
        targetSection.classList.add("active");

        // Render content according to section
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
            initHeatmap();
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

/**
 * Update header based on active section
 */
export function updateHeader(sectionId) {
  const searchInput = document.querySelector(".search-bar input");
  const searchBar = document.querySelector(".search-bar");
  const addActionBtn = document.getElementById("addBtn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const header = document.querySelector(".header");

  // Clear previous search
  if (searchInput) {
    searchInput.value = "";
  }
  clearSearchHighlights();

  // Reset filters
  filterButtons.forEach((btn) => {
    btn.style.display = "inline-flex";
  });

  switch (sectionId) {
    case "dashboard-section":
      // Hide header completely in dashboard
      if (header) header.style.display = "none";
      break;

    case "tablas-section":
    case "tareas-section":
      if (header) header.style.display = "flex";
      if (searchBar) searchBar.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar tareas...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Añadir Tarea";
      }
      break;

    case "calendario-section":
      if (header) header.style.display = "flex";
      // Hide search bar in calendar (no search functionality)
      if (searchBar) searchBar.style.display = "none";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nuevo Evento";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    case "notas-section":
      if (header) header.style.display = "flex";
      if (searchBar) searchBar.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar notas...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nueva Nota";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    default:
      if (header) header.style.display = "flex";
      if (searchBar) searchBar.style.display = "flex";
      break;
  }
}

/**
 * Initialize drawer (sidebar) for mobile
 */
export function initDrawer() {
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

  // Close drawer on mobile when selecting navigation
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
