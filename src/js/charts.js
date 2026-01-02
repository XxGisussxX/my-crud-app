import { getTasks, saveTasks } from "./storage.js";

let lineChartInstance = null;
let donutChartInstance = null;

// Migrar tareas antiguas que no tienen createdAt
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

// Función para preparar datos del line chart
function prepareLineChartData(tasks) {
  // Agrupar tareas por fecha de creación y completado
  const last7Days = [];
  const today = new Date();

  // Crear array de los últimos 7 días
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

  // Contar tareas creadas por día
  tasks.forEach((task) => {
    const createdAt = task.createdAt || new Date().toISOString().split("T")[0];
    const dateIndex = last7Days.findIndex((d) => d.date === createdAt);

    if (dateIndex !== -1) {
      last7Days[dateIndex].created++;
    } else if (new Date(createdAt) < new Date(last7Days[0].date)) {
      // Si es anterior, agregar al primer día
      last7Days[0].created++;
    } else {
      // Si es posterior, agregar al último día
      last7Days[last7Days.length - 1].created++;
    }
  });

  // Contar tareas completadas por día
  tasks.forEach((task) => {
    if (task.completed && task.completedAt) {
      const completedAt = task.completedAt;
      const dateIndex = last7Days.findIndex((d) => d.date === completedAt);

      if (dateIndex !== -1) {
        last7Days[dateIndex].completed++;
      } else if (new Date(completedAt) < new Date(last7Days[0].date)) {
        last7Days[0].completed++;
      } else {
        last7Days[last7Days.length - 1].completed++;
      }
    }
  });

  return {
    labels: last7Days.map((d) => d.label),
    created: last7Days.map((d) => d.created),
    completed: last7Days.map((d) => d.completed),
  };
}

// Función para preparar datos del donut chart
function prepareDonutChartData(tasks) {
  const priorityCount = {
    high: 0,
    medium: 0,
    low: 0,
  };

  tasks.forEach((task) => {
    const priority = task.priority || "medium";
    if (priorityCount.hasOwnProperty(priority)) {
      priorityCount[priority]++;
    }
  });

  return {
    labels: ["Alta", "Media", "Baja"],
    data: [priorityCount.high, priorityCount.medium, priorityCount.low],
    colors: ["#ef4444", "#f59e0b", "#3b82f6"],
  };
}

// Crear o actualizar line chart
export function updateLineChart() {
  const tasks = getTasks();
  const chartData = prepareLineChartData(tasks);
  const ctx = document.getElementById("lineChart");

  if (!ctx) return;

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: "Tareas Creadas",
          data: chartData.created,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
        {
          label: "Tareas Completadas",
          data: chartData.completed,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 13,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: {
            size: 14,
          },
          bodyFont: {
            size: 13,
          },
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
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

// Crear o actualizar donut chart
export function updateDonutChart() {
  const tasks = getTasks();
  const chartData = prepareDonutChartData(tasks);
  const ctx = document.getElementById("donutChart");

  if (!ctx) return;

  if (donutChartInstance) {
    donutChartInstance.destroy();
  }

  donutChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: chartData.colors,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 13,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: {
            size: 14,
          },
          bodyFont: {
            size: 13,
          },
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
        },
      },
    },
  });
}

// Función para calcular y actualizar las estadísticas del dashboard
function updateDashboardStats() {
  const tasks = getTasksFromStorage();

  // Total Tasks Completed
  const completedTasks = tasks.filter((task) => task.completed);
  const totalCompleted = completedTasks.length;

  // Avg. Completion Time (simulado por ahora)
  const avgCompletionTime = calculateAverageCompletionTime(completedTasks);

  // Overdue Tasks
  const overdueTasks = tasks.filter((task) => {
    if (!task.date || task.completed) return false;
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return taskDate < today;
  }).length;

  // Actualizar DOM
  const totalCompletedElement = document.getElementById("totalCompleted");
  const avgTimeElement = document.getElementById("avgTime");
  const overdueTasksElement = document.getElementById("overdueTasks");

  if (totalCompletedElement) {
    totalCompletedElement.textContent = totalCompleted;
  }

  if (avgTimeElement) {
    avgTimeElement.innerHTML = `${avgCompletionTime} <span class="unit">days</span>`;
  }

  if (overdueTasksElement) {
    overdueTasksElement.textContent = overdueTasks;
  }
}

// Función para calcular tiempo promedio de completación (simulada)
function calculateAverageCompletionTime(completedTasks) {
  if (completedTasks.length === 0) return "0.0";

  // Simulación: entre 1-5 días dependiendo de la prioridad
  let totalDays = 0;
  completedTasks.forEach((task) => {
    switch (task.priority) {
      case "high":
        totalDays += 1.5;
        break;
      case "medium":
        totalDays += 2.5;
        break;
      case "low":
        totalDays += 3.5;
        break;
      default:
        totalDays += 2.5;
    }
  });

  const average = totalDays / completedTasks.length;
  return average.toFixed(1);
}

// Actualizar la función renderTasks para incluir stats
function renderTasks() {
  const tasks = getTasksFromStorage();
  const container = document.getElementById("taskList");
  const tableBody = document.getElementById("tasksTableBody");

  if (!container && !tableBody) return;

  // ...existing render code...

  // Actualizar estadísticas del dashboard
  updateDashboardStats();
}

// Actualizar ambas gráficas
export function updateCharts() {
  updateLineChart();
  updateDonutChart();
}

// Inicializar gráficas
export function initCharts() {
  migrateTasks(); // Migrar tareas antiguas si es necesario
  updateCharts();
}
