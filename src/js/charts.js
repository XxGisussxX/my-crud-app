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

// Función para preparar datos del heat map (últimos 90 días)
function prepareHeatMapData(tasks) {
  const days = [];
  const today = new Date();

  // Generar últimos 90 días
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    days.push({
      date: dateStr,
      count: 0,
      day: date.getDay(),
      week: Math.floor(i / 7),
    });
  }

  // Contar tareas completadas por día
  tasks.forEach((task) => {
    if (task.completed && task.completedAt) {
      const dayData = days.find((d) => d.date === task.completedAt);
      if (dayData) {
        dayData.count++;
      }
    }
  });

  return days;
}

// Función para renderizar el heat map
function renderHeatMap() {
  const heatmapContainer = document.getElementById("heatmap-container");
  if (!heatmapContainer) return;

  const tasks = getTasks();
  const heatMapData = prepareHeatMapData(tasks);

  // Organizar datos por semanas y días
  const weeks = Math.ceil(heatMapData.length / 7);
  const weeksData = [];
  
  for (let week = 0; week < weeks; week++) {
    weeksData[week] = [];
    for (let day = 0; day < 7; day++) {
      const dataIndex = week * 7 + day;
      if (dataIndex < heatMapData.length) {
        weeksData[week][day] = heatMapData[dataIndex];
      }
    }
  }

  // Generar etiquetas de meses con mejor alineación
  const monthLabels = [];
  const monthPositions = {};
  const currentMonth = new Date().getMonth();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  // Calcular posiciones exactas de los cambios de mes
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 89);
  
  let lastMonth = null;
  for (let i = 0; i < heatMapData.length; i++) {
    const date = new Date(heatMapData[i].date);
    const monthKey = date.getMonth();
    
    // Registrar la primera ocurrencia de cada mes
    if (monthKey !== lastMonth) {
      // Calcular semana aproximada
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      const weekStart = Math.floor(i / 7);
      
      monthLabels.push({
        name: monthNames[monthKey],
        week: weekStart
      });
      lastMonth = monthKey;
    }
  }
  
  // Crear spans distribuidos por semanas
  const monthSpans = monthLabels.slice(0, 3).map(m => m.name);

  let html = `
    <div class="heatmap-title">Actividad de los últimos 90 días</div>
    <div class="heatmap-content">
      <div class="heatmap-months">
        ${monthSpans.map(month => `<span class="month-label">${month}</span>`).join('')}
      </div>
      <div class="heatmap-main">
        <div class="heatmap-days">
          <span class="day-label">L</span>
          <span class="day-label">M</span>
          <span class="day-label">M</span>
          <span class="day-label">J</span>
          <span class="day-label">V</span>
          <span class="day-label">S</span>
          <span class="day-label">D</span>
        </div>
        <div class="heatmap-grid">`;

  // Generar celdas del heat map
  heatMapData.forEach((day, index) => {
    const intensity = getHeatMapIntensity(day.count);
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("es-ES", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    html += `
      <div 
        class="heatmap-cell ${intensity}" 
        title="${day.count} tareas completadas el ${dayName}"
        data-count="${day.count}"
        data-date="${day.date}">
      </div>
    `;
  });

  html += `
        </div>
      </div>
      <div class="heatmap-legend">
        <span class="legend-text">Menos</span>
        <div class="legend-cells">
          <div class="heatmap-cell level-0"></div>
          <div class="heatmap-cell level-1"></div>
          <div class="heatmap-cell level-2"></div>
          <div class="heatmap-cell level-3"></div>
          <div class="heatmap-cell level-4"></div>
        </div>
        <span class="legend-text">Más</span>
      </div>
    </div>
  `;

  heatmapContainer.innerHTML = html;
}

// Función para determinar la intensidad del color
function getHeatMapIntensity(count) {
  if (count === 0) return "level-0";
  if (count <= 2) return "level-1";
  if (count <= 4) return "level-2";
  if (count <= 6) return "level-3";
  return "level-4";
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

// Actualizar ambas gráficas y heat map
export function updateCharts() {
  updateLineChart();
  updateDonutChart();
  renderHeatMap();
}

// Inicializar gráficas y heat map
export function initCharts() {
  migrateTasks(); // Migrar tareas antiguas si es necesario
  updateCharts();
}
