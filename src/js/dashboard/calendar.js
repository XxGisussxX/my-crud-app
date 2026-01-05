/**
 * Calendar Module for Dashboard
 * FullCalendar integration and task events
 */

import { getTasks } from "../shared/storage.js";

let calendarInstance = null;
const CAL_MODAL_ID = "calendarEventModal";
const CAL_CLOSE_BTNS = ["closeCalendarEvent", "cancelCalendarEvent"];

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

  CAL_CLOSE_BTNS.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", closeCalendarModal);
  });

  const modal = document.getElementById(CAL_MODAL_ID);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCalendarModal();
    });
  }
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
  const details = event.extendedProps || {};
  const modal = document.getElementById(CAL_MODAL_ID);
  if (!modal) return;

  const titleEl = document.getElementById("calEventTitle");
  const dateEl = document.getElementById("calEventDate");
  const priorityEl = document.getElementById("calEventPriority");
  const statusEl = document.getElementById("calEventStatus");
  const descEl = document.getElementById("calEventDescription");

  if (titleEl) titleEl.textContent = details.fullTitle || event.title || "";
  if (dateEl)
    dateEl.textContent = event.start
      ? new Date(event.start).toLocaleString("es-CO", {
          dateStyle: "full",
          timeStyle: "short",
        })
      : "";
  if (priorityEl)
    priorityEl.textContent = `Prioridad: ${details.priority || "-"}`;
  if (statusEl)
    statusEl.textContent = `Estado: ${
      details.completed ? "Completado" : "Pendiente"
    }`;
  if (descEl) descEl.textContent = details.description || "Sin descripción";

  modal.style.display = "flex";
}

function closeCalendarModal() {
  const modal = document.getElementById(CAL_MODAL_ID);
  if (modal) modal.style.display = "none";
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
