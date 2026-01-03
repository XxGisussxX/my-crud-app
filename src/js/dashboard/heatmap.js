/**
 * Heatmap Module for Dashboard
 * Activity heatmap visualization
 */

import { getTasks } from "../shared/storage.js";

/**
 * Initialize activity heatmap
 */
export function initHeatmap() {
  const heatmapContainer = document.getElementById("activityHeatmap");
  if (!heatmapContainer) return;

  const heatmapData = generateHeatmapData();
  renderHeatmap(heatmapContainer, heatmapData);
}

/**
 * Generate heatmap data from tasks
 */
function generateHeatmapData() {
  const tasks = getTasks();
  const heatmapData = {};

  // Initialize with last 12 weeks
  const today = new Date();
  for (let i = 84; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    heatmapData[dateStr] = 0;
  }

  // Count completed tasks per date
  tasks.forEach((task) => {
    if (task.completedAt) {
      const dateStr = task.completedAt.split("T")[0];
      if (heatmapData[dateStr] !== undefined) {
        heatmapData[dateStr]++;
      }
    }
  });

  return heatmapData;
}

/**
 * Render heatmap visualization
 */
function renderHeatmap(container, heatmapData) {
  const weeks = [];
  const dates = Object.keys(heatmapData).sort();

  // Group dates into weeks
  let currentWeek = [];
  dates.forEach((date) => {
    currentWeek.push({ date, count: heatmapData[date] });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Build HTML
  let html = '<div class="heatmap-grid">';

  weeks.forEach((week, weekIndex) => {
    html += `<div class="heatmap-week" data-week="${weekIndex}">`;

    week.forEach((day) => {
      const intensity = getHeatmapIntensity(day.count);
      const dateObj = new Date(day.date);
      const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "short" });

      html += `
        <div class="heatmap-cell ${intensity}" 
             title="${day.date}: ${day.count} completadas"
             data-date="${day.date}"
             data-count="${day.count}">
          <span class="heatmap-day-name">${dayName[0]}</span>
        </div>
      `;
    });

    html += "</div>";
  });

  html += "</div>";

  container.innerHTML = html;
  attachHeatmapListeners(container);
}

/**
 * Get heatmap intensity class based on count
 */
function getHeatmapIntensity(count) {
  if (count === 0) return "intensity-0";
  if (count <= 2) return "intensity-1";
  if (count <= 4) return "intensity-2";
  if (count <= 6) return "intensity-3";
  return "intensity-4";
}

/**
 * Attach hover listeners to heatmap cells
 */
function attachHeatmapListeners(container) {
  const cells = container.querySelectorAll(".heatmap-cell");

  cells.forEach((cell) => {
    cell.addEventListener("mouseenter", (e) => {
      const tooltip = document.createElement("div");
      tooltip.className = "heatmap-tooltip";
      tooltip.textContent = cell.title;

      document.body.appendChild(tooltip);

      const rect = cell.getBoundingClientRect();
      tooltip.style.left = rect.left + "px";
      tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + "px";

      cell.addEventListener(
        "mouseleave",
        () => {
          tooltip.remove();
        },
        { once: true }
      );
    });
  });
}

/**
 * Update heatmap data
 */
export function updateHeatmap() {
  const heatmapContainer = document.getElementById("activityHeatmap");
  if (!heatmapContainer) return;

  const heatmapData = generateHeatmapData();
  renderHeatmap(heatmapContainer, heatmapData);
}
