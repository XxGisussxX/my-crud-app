/**
 * Heatmap Module for Dashboard
 * Activity heatmap visualization
 */

import { getTasks } from "../shared/storage.js";

/**
 * Initialize activity heatmap
 */
export function initHeatmap() {
  const heatmapContainer = document.getElementById("heatmap-container");
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
  const dates = Object.keys(heatmapData).sort();
  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
  const monthNames = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };

  // Obtener meses y semanas
  const months = {};
  const cells = [];

  dates.forEach((date) => {
    const dateObj = new Date(date + "T00:00:00");
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    if (!months[monthKey]) {
      months[monthKey] = {
        name: monthNames[String(month).padStart(2, "0")],
        weeks: 0,
      };
    }

    cells.push({
      date,
      count: heatmapData[date],
      dayOfWeek: dateObj.getDay(),
      month: monthKey,
    });
  });

  // Build HTML structure
  let html = `
    <div class="heatmap-wrapper">
      <h3 class="heatmap-title">Actividad de Tareas</h3>
      <div class="heatmap-container">
        <div class="heatmap-months-row">
          <div class="heatmap-days-column"></div>
  `;

  // Agregar nombres de meses
  let lastMonth = null;
  let monthWeeks = 0;

  cells.forEach((cell) => {
    if (cell.month !== lastMonth) {
      if (lastMonth !== null) {
        html += `<div class="heatmap-month-label" style="grid-column: span ${monthWeeks};">${months[lastMonth].name}</div>`;
      }
      lastMonth = cell.month;
      monthWeeks = 0;
    }
    if (cell.dayOfWeek === 0) {
      monthWeeks++;
    }
  });

  if (lastMonth !== null) {
    html += `<div class="heatmap-month-label" style="grid-column: span ${monthWeeks};">${months[lastMonth].name}</div>`;
  }

  html += `
        </div>
        <div class="heatmap-body">
          <div class="heatmap-days-column">
  `;

  // Agregar nombres de días de la semana
  dayNames.forEach((day) => {
    html += `<div class="heatmap-day-label">${day}</div>`;
  });

  html += `
          </div>
          <div class="heatmap-grid">
  `;

  // Agregar celdas del heatmap
  cells.forEach((cell) => {
    const intensity = getHeatmapIntensity(cell.count);
    html += `
      <div class="heatmap-cell ${intensity}" 
           title="${cell.date}: ${cell.count} completadas"
           data-date="${cell.date}"
           data-count="${cell.count}">
      </div>
    `;
  });

  html += `
          </div>
        </div>
      </div>
      <div class="heatmap-legend">
        <span>Menos</span>
        <div class="heatmap-cell intensity-0"></div>
        <div class="heatmap-cell intensity-1"></div>
        <div class="heatmap-cell intensity-2"></div>
        <div class="heatmap-cell intensity-3"></div>
        <div class="heatmap-cell intensity-4"></div>
        <span>Más</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
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
 * Update heatmap data
 */
export function updateHeatmap() {
  const heatmapContainer = document.getElementById("heatmap-container");
  if (!heatmapContainer) return;

  const heatmapData = generateHeatmapData();
  renderHeatmap(heatmapContainer, heatmapData);
}
