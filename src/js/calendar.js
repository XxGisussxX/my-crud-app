import { getTasks } from "./storage.js";

let calendarInstance = null;

// Función para obtener el color según la prioridad
function getPriorityColor(priority, completed) {
  if (completed) {
    return "#10b981"; // Verde
  }

  switch (priority) {
    case "high":
      return "#ef4444"; // Rojo
    case "medium":
      return "#f59e0b"; // Amarillo/Naranja
    case "low":
      return "#3b82f6"; // Azul
    default:
      return "#f59e0b"; // Por defecto Amarillo/Naranja
  }
}

// Función para convertir tareas a eventos de FullCalendar
function tasksToEvents(tasks) {
  return tasks
    .filter((task) => task.date) // Solo tareas con fecha
    .map((task) => {
      const color = getPriorityColor(task.priority, task.completed);
      const title =
        task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text;

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
  const calendarEl = document.getElementById("calendario");
  if (!calendarEl) {
    console.error("Elemento calendario no encontrado");
    return;
  }

  // Verificar que FullCalendar esté disponible
  if (typeof FullCalendar === "undefined") {
    console.error("FullCalendar no está cargado, reintentando...");
    setTimeout(() => {
      initCalendar();
    }, 300);
    return;
  }

  // Si ya existe una instancia, destruirla primero
  if (calendarInstance) {
    calendarInstance.destroy();
    calendarInstance = null;
  }

  const tasks = getTasks();
  const events = tasksToEvents(tasks);

  try {
    calendarInstance = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "es",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,listWeek",
      },
      buttonText: {
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        list: "Lista",
      },
      height: "100%",
      expandRows: true,
      events: events,
      eventDisplay: "block",
      dayMaxEvents: 3,
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
        info.el.style.cursor = "pointer";

        // Agregar tooltip con descripción completa
        const fullTitle = info.event.extendedProps.fullTitle;
        const description = info.event.extendedProps.description;
        let tooltipText = fullTitle;
        if (description) {
          tooltipText += `\n\n${description}`;
        }
        info.el.setAttribute("title", tooltipText);
      },
      eventClick: function (info) {
        // Opcional: agregar funcionalidad al hacer clic en un evento
        console.log("Evento clickeado:", info.event.extendedProps);
      },
    });

    calendarInstance.render();
    console.log("Calendario renderizado exitosamente");
  } catch (error) {
    console.error("Error al inicializar calendario:", error);
  }
}

// Función para actualizar los eventos del calendario
export function updateCalendarEvents() {
  if (!calendarInstance) {
    // Si no hay instancia pero estamos en la sección de calendario, inicializar
    const calendarSection = document.getElementById("calendario-section");
    if (calendarSection && calendarSection.classList.contains("active")) {
      initCalendar();
    }
    return;
  }

  const tasks = getTasks();
  const events = tasksToEvents(tasks);

  // Remover todos los eventos y agregar los nuevos
  calendarInstance.removeAllEvents();
  calendarInstance.addEventSource(events);
  calendarInstance.refetchEvents();
}
