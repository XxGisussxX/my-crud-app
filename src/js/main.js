import { addTask } from "./logic.js";
import { renderTasks, updateStats, renderTasksTable } from "./ui.js";
import { initCharts, updateCharts } from "./charts.js";
import { initCalendar, updateCalendarEvents } from "./calendar.js";

const btn = document.getElementById("addBtn");
const modal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const taskForm = document.getElementById("taskForm");

// Navegación entre secciones
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section-content");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remover clase active de todos los nav-items
    navItems.forEach((nav) => nav.classList.remove("active"));
    // Agregar clase active al nav-item clickeado
    item.classList.add("active");

    // Ocultar todas las secciones
    sections.forEach((section) => section.classList.remove("active"));

    // Mostrar la sección correspondiente
    const sectionId = item.dataset.section + "-section";
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");

      // Si es la sección de Tablas, renderizar la tabla
      if (sectionId === "tablas-section") {
        renderTasksTable();
      }

      // Si es la sección de Tareas (cards), renderizar tarjetas
      if (sectionId === "tareas-section") {
        renderTasks();
      }

      // Si es la sección de Calendar, inicializar el calendario
      if (sectionId === "calendario-section") {
        // Dar tiempo para que el DOM se actualice
        setTimeout(() => {
          initCalendar();
        }, 100);
      }

      // Si es la sección de Dashboard, actualizar gráficas
      if (sectionId === "dashboard-section") {
        setTimeout(() => {
          updateCharts();
        }, 100);
      }
    }
  });
});

// Filtrar entre estados
const filterItems = document.querySelectorAll(".filter-btn");

filterItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remover el atributo active de los button filter
    filterItems.forEach((button) => button.classList.remove("active"));
    // Agregar clase activa al boton clickeado
    item.classList.add("active");

    // Determinar qué sección está activa y renderizar apropiadamente
    const activeSection = document.querySelector(".section-content.active");
    if (activeSection) {
      if (activeSection.id === "tablas-section") {
        renderTasksTable();
      } else if (activeSection.id === "tareas-section") {
        renderTasks();
      }
    }
  });
});

// Abrir modal
btn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Cerrar modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  taskForm.reset();
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  taskForm.reset();
});

// Cerrar modal al hacer clic fuera de él
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    taskForm.reset();
  }
});

// Enviar formulario
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(taskForm);
  const title = formData.get("title");
  const description = formData.get("description") || "";
  const priority = formData.get("priority");
  const date = formData.get("date") || "";

  if (title.trim() === "") return;

  // Crear objeto de tarea con toda la información
  const taskData = {
    text: title,
    description,
    priority,
    date,
  };

  addTask(taskData);
  modal.style.display = "none";
  taskForm.reset();

  // Determinar qué sección está activa y renderizar apropiadamente
  const activeSection = document.querySelector(".section-content.active");
  if (activeSection) {
    if (activeSection.id === "tablas-section") {
      renderTasksTable();
    } else if (activeSection.id === "tareas-section") {
      renderTasks();
    } else if (activeSection.id === "calendario-section") {
      updateCalendarEvents();
    } else if (activeSection.id === "dashboard-section") {
      updateCharts();
    }
  }

  updateStats();
});

// Funcionalidad del carrusel
function initCarousel() {
  const container = document.getElementById("tasksContainer");
  const leftArrow = document.getElementById("carouselLeft");
  const rightArrow = document.getElementById("carouselRight");

  if (!container || !leftArrow || !rightArrow) return;

  function updateArrowStates() {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const canScroll = scrollWidth > clientWidth;

    // Si no hay suficiente contenido para hacer scroll, ocultar ambas flechas
    if (!canScroll) {
      leftArrow.style.display = "none";
      rightArrow.style.display = "none";
      return;
    }

    // Mostrar las flechas si hay contenido para hacer scroll
    leftArrow.style.display = "flex";
    rightArrow.style.display = "flex";

    // Deshabilitar/habilitar flechas según la posición del scroll
    if (scrollLeft <= 5) {
      leftArrow.classList.add("disabled");
    } else {
      leftArrow.classList.remove("disabled");
    }

    if (scrollLeft >= scrollWidth - clientWidth - 5) {
      rightArrow.classList.add("disabled");
    } else {
      rightArrow.classList.remove("disabled");
    }
  }

  // Navegar hacia la izquierda
  leftArrow.addEventListener("click", () => {
    const cardWidth = 280 + 24; // ancho de tarjeta + gap
    container.scrollBy({
      left: -cardWidth * 2,
      behavior: "smooth",
    });
  });

  // Navegar hacia la derecha
  rightArrow.addEventListener("click", () => {
    const cardWidth = 280 + 24; // ancho de tarjeta + gap
    container.scrollBy({
      left: cardWidth * 2,
      behavior: "smooth",
    });
  });

  // Actualizar estado de las flechas al hacer scroll
  container.addEventListener("scroll", updateArrowStates);

  // Actualizar estado inicial
  updateArrowStates();

  // Actualizar cuando se renderizan las tareas
  const observer = new MutationObserver(() => {
    setTimeout(updateArrowStates, 100);
  });

  observer.observe(container, { childList: true, subtree: true });
}

// Inicialización
updateStats();
initCarousel();
initCharts();

// Renderizar la vista activa al cargar
const tablasSection = document.getElementById("tablas-section");
if (tablasSection && tablasSection.classList.contains("active")) {
  renderTasksTable();
}

console.log("TaskMaster inicializado correctamente");