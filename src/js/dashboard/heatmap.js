/**
 * Heatmap Module for Dashboard
 * Activity heatmap visualization (GitHub-style)
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
 * Generate heatmap data from tasks (all of 2026)
 */
function generateHeatmapData() {
  const tasks = getTasks();
  const heatmapData = {};

  // Generate all days of 2026
  const startDate = new Date(2026, 0, 1); // January 1, 2026
  const endDate = new Date(2026, 11, 31); // December 31, 2026

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
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
 * Render heatmap visualization (GitHub-style)
 */
function renderHeatmap(container, heatmapData) {
  const dates = Object.keys(heatmapData).sort();
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Organize dates into weeks
  const weeks = [];
  let currentWeek = [];

  dates.reverse().forEach((date) => {
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();

    currentWeek.push({
      date,
      count: heatmapData[date],
      dayOfWeek,
      month: dateObj.getMonth(),
      year: dateObj.getFullYear(),
    });

    // Complete week on Sunday (day 0)
    if (dayOfWeek === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Reverse to show oldest weeks first
  weeks.reverse();

  // Get month labels
  const monthLabels = {};
  let lastMonth = null;
  dates.forEach((date) => {
    const dateObj = new Date(date + "T00:00:00");
    const month = dateObj.getMonth();
    const monthKey = `${dateObj.getFullYear()}-${month}`;
    if (month !== lastMonth) {
      monthLabels[monthKey] = months[month];
      lastMonth = month;
    }
  });

  // Build HTML
  let html = `
    <div class="heatmap-wrapper">
      <h3 class="heatmap-title">Actividad de Tareas</h3>
      <div class="heatmap-grid-container">
        <div class="heatmap-header">
          <div class="heatmap-spacer"></div>
          <div class="heatmap-months">
  `;

  // Add month labels
  let currentMonthIndex = 0;
  weeks.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const monthKey = `${week[0].year}-${week[0].month}`;
      if (monthLabels[monthKey] && currentMonthIndex !== week[0].month) {
        html += `<span class="month-label" style="grid-column: ${
          weekIndex + 1
        }">${monthLabels[monthKey]}</span>`;
        currentMonthIndex = week[0].month;
      }
    }
  });

  html += `
          </div>
        </div>
        <div class="heatmap-body">
          <div class="heatmap-days-column">
  `;

  // Add day labels
  dayLabels.forEach((label) => {
    html += `<div class="day-label">${label}</div>`;
  });

  html += `
          </div>
          <div class="heatmap-grid">
  `;

  // Add cells organized by week (columns) and day (rows)
  weeks.forEach((week) => {
    // Ensure 7 days per week
    const weekCells = Array(7)
      .fill(null)
      .map((_, i) => week.find((cell) => cell.dayOfWeek === i) || null);

    weekCells.forEach((cell) => {
      if (cell) {
        const intensity = getIntensity(cell.count);
        html += `
          <div class="heatmap-cell ${intensity}" 
               title="${cell.date}: ${cell.count} tareas completadas"
               data-date="${cell.date}">
          </div>
        `;
      } else {
        html += `<div class="heatmap-cell empty"></div>`;
      }
    });
  });

  html += `
          </div>
        </div>
      </div>
      <div class="heatmap-legend">
        <span class="legend-text">Menos</span>
        <div class="heatmap-cell level-0"></div>
        <div class="heatmap-cell level-1"></div>
        <div class="heatmap-cell level-2"></div>
        <div class="heatmap-cell level-3"></div>
        <div class="heatmap-cell level-4"></div>
        <span class="legend-text">Más</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Get intensity level based on count
 */
function getIntensity(count) {
  if (count === 0) return "level-0";
  if (count <= 2) return "level-1";
  if (count <= 4) return "level-2";
  if (count <= 6) return "level-3";
  return "level-4";
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
