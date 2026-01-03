/**
 * Dashboard Module
 * Charts, calendar and statistics visualization
 */

import { getTasks, saveTasks } from "../shared/storage.js";

// Chart.js instances
let lineChartInstance = null;
let donutChartInstance = null;

/**
 * Initialize charts and update data
 */
export function initCharts() {
  migrateTasks();
  updateCharts();
}

/**
 * Update all dashboard charts
 */
export function updateCharts() {
  updateLineChart();
  updateDonutChart();
}

/**
 * Migrate old tasks without createdAt
 */
function migrateTasks() {
  const tasks = getTasks();
  let needsMigration = false;

  const migratedTasks = tasks.map((task) => {
    if (!task.createdAt) {
      needsMigration = true;
      return {
        ...task,
        createdAt: task.date || new Date().toISOString().split("T")[0],
        completedAt:
          task.completed && !task.completedAt
            ? new Date().toISOString().split("T")[0]
            : task.completedAt || null,
      };
    }
    return task;
  });

  if (needsMigration) {
    saveTasks(migratedTasks);
  }
}

/**
 * Prepare data for line chart
 */
function prepareLineChartData(tasks) {
  const last7Days = [];
  const today = new Date();

  // Create array of last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    last7Days.push({
      date: dateStr,
      label: date.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
      created: 0,
      completed: 0,
    });
  }

  // Count created and completed tasks by date
  tasks.forEach((task) => {
    const createdDate = task.createdAt?.split("T")[0];
    const completedDate = task.completedAt?.split("T")[0];

    last7Days.forEach((day) => {
      if (createdDate === day.date) day.created++;
      if (completedDate === day.date) day.completed++;
    });
  });

  return last7Days;
}

/**
 * Update line chart
 */
function updateLineChart() {
  const canvas = document.getElementById("lineChart");
  if (!canvas) return;

  const tasks = getTasks();
  const chartData = prepareLineChartData(tasks);

  const labels = chartData.map((d) => d.label);
  const createdData = chartData.map((d) => d.created);
  const completedData = chartData.map((d) => d.completed);

  const ctx = canvas.getContext("2d");

  // Destroy existing chart
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Creadas",
          data: createdData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Completadas",
          data: completedData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

/**
 * Update donut chart
 */
function updateDonutChart() {
  const canvas = document.getElementById("donutChart");
  if (!canvas) return;

  const tasks = getTasks();

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;

  const ctx = canvas.getContext("2d");

  // Destroy existing chart
  if (donutChartInstance) {
    donutChartInstance.destroy();
  }

  donutChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completadas", "Pendientes"],
      datasets: [
        {
          data: [completed, pending],
          backgroundColor: ["#10b981", "#ef4444"],
          borderColor: ["#059669", "#dc2626"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
      },
    },
  });
}

/**
 * Get dashboard statistics
 */
export function getDashboardStats() {
  const tasks = getTasks();
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const total = tasks.length;

  return {
    total,
    completed,
    pending,
    completionRate:
      total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Update dashboard stats display
 */
export function updateDashboardStats() {
  const stats = getDashboardStats();

  const totalEl = document.querySelector('[data-stat="total"]');
  const completedEl = document.querySelector('[data-stat="completed"]');
  const pendingEl = document.querySelector('[data-stat="pending"]');
  const rateEl = document.querySelector('[data-stat="rate"]');

  if (totalEl) totalEl.textContent = stats.total;
  if (completedEl) completedEl.textContent = stats.completed;
  if (pendingEl) pendingEl.textContent = stats.pending;
  if (rateEl) rateEl.textContent = `${stats.completionRate}%`;
}

/**
 * Destroy all chart instances
 */
export function destroyCharts() {
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }

  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }
}
