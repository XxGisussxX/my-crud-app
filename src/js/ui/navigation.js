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
  const dashboardSection = ["dashboard"];
  const restrictedSections = ["calendario", "tablas"];

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const section = item.dataset.section;
      const isMobileTablet = window.innerWidth <= 779;
      const isMobileSmall = window.innerWidth < 675;
      const isDashboard = dashboardSection.includes(section);
      const isRestricted = restrictedSections.includes(section);

      // Check if trying to access dashboard on mobile/tablet
      if (isMobileTablet && isDashboard) {
        e.preventDefault();
        e.stopPropagation();
        showMobileRestrictionMessage();
        return;
      }

      // Check if trying to access restricted sections on small mobile
      if (isMobileSmall && isRestricted) {
        e.preventDefault();
        e.stopPropagation();
        showMobileRestrictionMessage();
        return;
      }

      e.stopPropagation(); // Prevent drawer from closing when clicking nav items

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

  // Update restricted sections styling on load and resize
  updateRestrictedSectionsStyle();
  window.addEventListener("resize", updateRestrictedSectionsStyle);
}

/**
 * Update header based on active section
 */
export function updateHeader(sectionId) {
  const searchInput = document.querySelector(".search-bar input");
  const searchBar = document.querySelector(".search-bar");
  const addActionBtn = document.getElementById("addBtn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");
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
      // Show header only on tablet/mobile so the hamburger stays available
      if (header) {
        header.style.display = window.innerWidth <= 1024 ? "flex" : "none";
      }
      if (searchBar) searchBar.style.display = "none";
      // Hide add button on mobile/tablet for dashboard
      if (addActionBtn) {
        addActionBtn.style.display =
          window.innerWidth <= 1024 ? "none" : "none";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      if (statusFilter) statusFilter.style.display = "none";
      if (priorityFilter) priorityFilter.style.display = "none";
      break;

    case "tablas-section":
    case "tareas-section":
      if (header) header.style.display = "flex";
      if (searchBar) searchBar.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar tareas...";
      if (addActionBtn) addActionBtn.style.display = "inline-flex";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Añadir Tarea";
      }
      // Show dropdowns for tasks
      if (statusFilter) statusFilter.style.display = "inline-block";
      if (priorityFilter) priorityFilter.style.display = "inline-block";
      break;

    case "calendario-section":
      if (header) header.style.display = "flex";
      // Hide search bar in calendar (no search functionality)
      if (searchBar) searchBar.style.display = "none";
      if (addActionBtn) addActionBtn.style.display = "inline-flex";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nuevo Evento";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      // Hide dropdowns in calendar
      if (statusFilter) statusFilter.style.display = "none";
      if (priorityFilter) priorityFilter.style.display = "none";
      break;

    case "notas-section":
      if (header) header.style.display = "flex";
      if (searchBar) searchBar.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar notas...";
      if (addActionBtn) addActionBtn.style.display = "inline-flex";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nueva Nota";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      // Hide dropdowns in notes
      if (statusFilter) statusFilter.style.display = "none";
      if (priorityFilter) priorityFilter.style.display = "none";
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

  // Solo cerrar cuando se hace click FUERA del sidebar
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    hamburgerBtn.classList.remove("active");
  });

  // Evita que los clicks dentro del sidebar cierren el drawer
  sidebar.addEventListener("click", (e) => {
    e.stopPropagation();
  });

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

/**
 * Show message when trying to access restricted sections on small mobile
 */
function showMobileRestrictionMessage() {
  // Remove existing notification if present
  const existingNotif = document.querySelector(
    ".mobile-restriction-notification"
  );
  if (existingNotif) {
    existingNotif.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "mobile-restriction-notification";
  notification.innerHTML = `
    <div class="notification-content">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Esta sección está disponible en pantallas más grandes</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

/**
 * Update styling for restricted sections on small mobile
 */
function updateRestrictedSectionsStyle() {
  const dashboardSection = ["dashboard"];
  const restrictedSections = ["calendario", "tablas"];
  const isMobileTablet = window.innerWidth <= 779;
  const isMobileSmall = window.innerWidth < 675;
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    const section = item.dataset.section;
    const isDashboard = dashboardSection.includes(section);
    const isRestricted = restrictedSections.includes(section);

    // Disable dashboard on mobile/tablet
    if (isMobileTablet && isDashboard) {
      item.style.opacity = "0.5";
      item.style.cursor = "not-allowed";
      item.style.pointerEvents = "auto";
    }
    // Disable calendario/tablas on small mobile
    else if (isMobileSmall && isRestricted) {
      item.style.opacity = "0.5";
      item.style.cursor = "not-allowed";
      item.style.pointerEvents = "auto";
    } else {
      item.style.opacity = "1";
      item.style.cursor = "pointer";
      item.style.pointerEvents = "auto";
    }
  });
}
