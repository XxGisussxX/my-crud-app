/**
 * Calendar Module for Dashboard
 * FullCalendar integration and task events
 */

import { getTasks } from "../shared/storage.js";

let calendarInstance = null;

/**
 * Get priority color
 */
function getPriorityColor(priority, completed) {
  if (completed) {
    return "#10b981"; // Green
  }

  switch (priority) {
    case "high":
      return "#ef4444"; // Red
    case "medium":
      return "#f59e0b"; // Orange
    case "low":
      return "#3b82f6"; // Blue
    default:
      return "#f59e0b";
  }
}

/**
 * Convert tasks to FullCalendar events
 */
function tasksToEvents(tasks) {
  return tasks
    .filter((task) => task.date)
    .map((task) => {
      const color = getPriorityColor(task.priority, task.completed);
      const title =
        task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text;

      return {
        id: task.id,
        title,
        start: task.date,
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: {
          description: task.description,
          priority: task.priority,
          completed: task.completed,
          fullTitle: task.text,
        },
      };
    });
}

/**
 * Initialize calendar
 */
export function initCalendar() {
  const calendarEl = document.getElementById("calendario");
  if (!calendarEl) return;

  const tasks = getTasks();
  const events = tasksToEvents(tasks);

  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    locale: "es",
    events,
    eventClick: (info) => {
      showEventDetails(info.event);
    },
    dayCellDidMount: (info) => {
      info.el.style.cursor = "pointer";
    },
    height: "auto",
  });

  calendarInstance.render();
}

/**
 * Update calendar events
 */
export function updateCalendarEvents() {
  if (!calendarInstance) return;

  const tasks = getTasks();
  const events = tasksToEvents(tasks);

  calendarInstance.removeAllEvents();
  events.forEach((event) => {
    calendarInstance.addEvent(event);
  });
}

/**
 * Show event details (task)
 */
function showEventDetails(event) {
  const details = event.extendedProps;
  const message = `
📌 ${details.fullTitle}
📅 ${event.start}
⚠️  Prioridad: ${details.priority}
✅ Estado: ${details.completed ? "Completado" : "Pendiente"}
${details.description ? `\n📝 ${details.description}` : ""}
  `.trim();

  alert(message);
}

/**
 * Destroy calendar
 */
export function destroyCalendar() {
  if (calendarInstance) {
    calendarInstance.destroy();
    calendarInstance = null;
  }
}
