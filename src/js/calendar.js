import { getTasks } from "./storage.js";

let calendarInstance = null;

// Función para obtener el color según la prioridad
function getPriorityColor(priority, completed) {
  if (completed) {
    return "#10b981"; // Verde para completadas
  }
  
  switch (priority) {
    case "high":
      return "#ef4444"; // Rojo
    case "medium":
      return "#f59e0b"; // Amarillo/Naranja
    case "low":
      return "#3b82f6"; // Azul
    default:
      return "#f59e0b"; // Por defecto amarillo
  }
}

// Función para convertir tareas a eventos de FullCalendar
function tasksToEvents(tasks) {
  return tasks
    .filter((task) => task.date) // Solo tareas con fecha
    .map((task) => {
      const color = getPriorityColor(task.priority, task.completed);
      const title = task.text.length > 20 
        ? task.text.substring(0, 20) + "..." 
        : task.text;
      
      return {
        id: task.id,
        title: title,
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

// Función para inicializar el calendario
export function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  // Verificar que FullCalendar esté disponible
  // En FullCalendar v6 desde CDN, está disponible como window.FullCalendar
  if (typeof window === "undefined" || !window.FullCalendar) {
    console.error("FullCalendar no está disponible, reintentando...");
    // Reintentar después de un breve delay
    setTimeout(() => {
      initCalendar();
    }, 200);
    return;
  }

  // Si ya existe una instancia, destruirla primero
  if (calendarInstance) {
    calendarInstance.destroy();
    calendarInstance = null;
  }

  const tasks = getTasks();
  const events = tasksToEvents(tasks);

  calendarInstance = new window.FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "en",
    headerToolbar: {
      left: "prev",
      center: "title",
      right: "next today",
    },
    height: "auto",
    events: events,
    eventDisplay: "block",
    dayMaxEvents: true,
    moreLinkClick: "popover",
    eventDidMount: function (info) {
      // Agregar punto de color según prioridad
      const priority = info.event.extendedProps.priority;
      const completed = info.event.extendedProps.completed;
      const color = getPriorityColor(priority, completed);
      
      // Personalizar el estilo del evento
      info.el.style.backgroundColor = color;
      info.el.style.borderColor = color;
      info.el.style.borderRadius = "6px";
      info.el.style.padding = "4px 8px";
      info.el.style.fontSize = "13px";
      info.el.style.fontWeight = "500";
      info.el.style.color = "#ffffff";
      
      // Agregar tooltip con descripción completa
      if (info.event.extendedProps.description) {
        info.el.setAttribute(
          "title",
          `${info.event.extendedProps.fullTitle}\n${info.event.extendedProps.description}`
        );
      }
    },
    datesSet: function (dateInfo) {
      // Actualizar eventos cuando cambia el mes
      updateCalendarEvents();
    },
  });

  calendarInstance.render();
}

// Función para actualizar los eventos del calendario
export function updateCalendarEvents() {
  if (!calendarInstance) {
    // Si no hay instancia pero estamos en la sección de calendario, inicializar
    const calendarSection = document.getElementById("calendar-section");
    if (calendarSection && calendarSection.classList.contains("active")) {
      initCalendar();
    }
    return;
  }

  const tasks = getTasks();
  const events = tasksToEvents(tasks);
  
  calendarInstance.removeAllEvents();
  calendarInstance.addEventSource(events);
}

