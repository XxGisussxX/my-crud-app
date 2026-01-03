import { addTask, toggleTask, deleteTask } from "./logic.js";
import { renderTasks, updateStats, renderTasksTable } from "./ui.js";
import { initCharts, updateCharts } from "./charts.js";
import { initCalendar, updateCalendarEvents } from "./calendar.js";
import { getTasks, saveTasks } from "./storage.js";
import { showConfirmation } from "./confirmation.js";

// Hacer funciones disponibles globalmente para compatibilidad
window.getTasks = getTasks;
window.saveTasks = saveTasks;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.renderTasks = renderTasks;
window.renderTasksTable = renderTasksTable;
window.updateStats = updateStats;
window.showConfirmation = showConfirmation;
window.updateCharts = updateCharts;
window.initCalendar = initCalendar;
window.updateCalendarEvents = updateCalendarEvents;

// ============================================
// FUNCIONES DE NOTAS
// ============================================

function getNotes() {
  const notes = localStorage.getItem("notes");
  return notes ? JSON.parse(notes) : [];
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function createNote(noteData) {
  const notes = getNotes();
  const newNote = {
    id: crypto.randomUUID(),
    type: noteData.type,
    title: noteData.title,
    content: noteData.content,
    color: noteData.color || getDefaultColor(noteData.type),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...noteData.specificData,
  };
  notes.push(newNote);
  saveNotes(notes);
  renderNotes();
  return newNote;
}

function updateNote(noteId, updateData) {
  const notes = getNotes();
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex === -1) return;

  // Mantener datos originales y actualizar con los nuevos
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updateData,
    // Mantener specificData si existe
    ...(updateData.specificData && { specificData: updateData.specificData }),
    updatedAt: new Date().toISOString(),
  };

  saveNotes(notes);
  renderNotes();
  return notes[noteIndex];
}

function getDefaultColor(type) {
  const colors = {
    standard: "#fef3c7",
    checklist: "#d1fae5",
    idea: "#fce7f3",
    meeting: "#dbeafe",
    sticky: "#fef3c7",
  };
  return colors[type] || "#ffffff";
}

function renderNotes() {
  const container = document.getElementById("notasGrid");
  if (!container) return;

  const notes = getNotes();
  if (notes.length === 0) {
    container.innerHTML = ``;
    return;
  }

  container.innerHTML = notes.map((note) => renderNoteCard(note)).join("");

  // Event delegation para los botones de acción de notas
  if (!container.dataset.listenerAdded) {
    container.addEventListener("click", (e) => {
      const noteCard = e.target.closest(".note-card");
      if (!noteCard) return;

      const noteId = noteCard.dataset.noteId;
      if (!noteId) return;

      // Manejar clicks en botones de acción
      if (e.target.classList.contains("edit-note")) {
        editNote(noteId);
      } else if (e.target.classList.contains("delete-note")) {
        deleteNoteWithConfirmation(noteId);
      }
      // Manejar clicks en items de checklist
      else if (e.target.closest(".checklist-item-preview")) {
        const itemPreview = e.target.closest(".checklist-item-preview");
        const itemIndex = parseInt(itemPreview.dataset.itemIndex);
        if (!isNaN(itemIndex)) {
          toggleChecklistItem(noteId, itemIndex);
        }
      }
    });
    container.dataset.listenerAdded = "true";
  }
}

function renderNoteCard(note) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString();

  // Función para calcular el tamaño de la nota según su contenido
  function getContentSize(type, content, specificData) {
    if (type === "sticky") {
      const length = content?.length || 0;
      if (length > 100) return "medium";
      return "small";
    }
    if (type === "standard") {
      const contentLength = content?.length || 0;
      const tagsCount = specificData?.tags?.length || 0;
      if (contentLength > 150 || tagsCount > 3) return "medium";
      if (contentLength > 80) return "small";
      return "small";
    }
    if (type === "idea") {
      const contentLength = content?.length || 0;
      const keyPointsCount = specificData?.keyPoints?.length || 0;
      // Si hay puntos clave, al menos medium para evitar corte
      if (keyPointsCount > 4 || contentLength > 220) return "large";
      if (keyPointsCount > 0 || contentLength > 120) return "medium";
      return "small";
    }
    // Checklist siempre tamaño medium para mantener consistencia
    if (type === "checklist") {
      return "medium";
    }
    if (type === "meeting") {
      return "medium";
    }
    return "small";
  }

  const size = getContentSize(note.type, note.content, note.specificData);

  switch (note.type) {
    case "standard":
      return `<div class="note-card" style="background-color: ${
        note.color
      }" data-note-id="${note.id}" data-size="${size}">
        <div class="note-header">
          <h3 class="note-title">${note.title}</h3>
          <div class="note-actions">
            <button class="note-action-btn edit-note" title="Edit">✏️</button>
            <button class="note-action-btn delete-note" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="note-content"><p>${note.content || ""}</p></div>
        <div class="note-footer">
          <div class="note-tags">${(note.specificData?.tags || [])
            .map((tag) => `<span class="note-tag">${tag}</span>`)
            .join("")}</div>
          <div class="note-date">${formattedDate}</div>
        </div>
      </div>`;

    case "sticky":
      return `<div class="note-card sticky-card" style="background-color: ${note.color}" data-note-id="${note.id}" data-size="${size}">
        <div class="note-actions">
          <button class="note-action-btn edit-note" title="Edit">✏️</button>
          <button class="note-action-btn delete-note" title="Delete">🗑️</button>
        </div>
        <div class="sticky-content"><p>${note.content}</p></div>
        <div class="sticky-pin">📌</div>
        <div class="note-date">${formattedDate}</div>
      </div>`;

    case "checklist":
      const items = note.specificData?.items || [];
      const completedItems = items.filter((item) => item.checked).length;
      const totalItems = items.length;
      const progressText =
        totalItems > 0 ? `${completedItems}/${totalItems}` : "0/0";

      return `<div class="note-card checklist-card" data-note-id="${
        note.id
      }" data-size="${size}">
        <div class="note-header">
          <h3 class="note-title">${note.title}</h3>
          <div class="note-actions">
            <button class="note-action-btn edit-note" title="Edit">✏️</button>
            <button class="note-action-btn delete-note" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="note-content">
          <div class="checklist-items">
            ${items
              .slice(0, 5)
              .map(
                (item, index) => `
              <div class="checklist-item-preview ${
                item.checked ? "checked" : ""
              }" 
                   data-item-index="${index}" 
                   style="cursor: pointer; user-select: none;">
                <span class="checkmark" style="cursor: pointer;">${
                  item.checked ? "✓" : "○"
                }</span>
                <span class="item-text" style="cursor: pointer;">${
                  item.text
                }</span>
              </div>
            `
              )
              .join("")}
            ${
              totalItems > 5
                ? `<div class="more-items">+${totalItems - 5} more items</div>`
                : ""
            }
          </div>
          <div class="checklist-progress">${progressText}</div>
        </div>
        <div class="note-footer">
          <div class="note-date">${formattedDate}</div>
        </div>
      </div>`;

    case "idea":
      const keyPoints = note.specificData?.keyPoints || [];
      const potential = note.specificData?.potential || "normal";

      return `<div class="note-card idea-card" data-note-id="${
        note.id
      }" data-size="${size}">
        <div class="note-header">
          <h3 class="note-title">${note.title}</h3>
          <div class="note-actions">
            <button class="note-action-btn edit-note" title="Edit">✏️</button>
            <button class="note-action-btn delete-note" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="note-content">
          <div class="idea-potential ${potential}">${potential}</div>
          <div class="idea-description"><p>${note.content}</p></div>
          ${
            keyPoints.length > 0
              ? `
            <div class="key-points">
              ${keyPoints
                .slice(0, 3)
                .map((point) => `<div class="key-point">${point}</div>`)
                .join("")}
              ${
                keyPoints.length > 3
                  ? `<div class="more-items">+${
                      keyPoints.length - 3
                    } more points</div>`
                  : ""
              }
            </div>
          `
              : ""
          }
        </div>
        <div class="note-footer">
          <div class="note-date">${formattedDate}</div>
        </div>
      </div>`;

    case "meeting":
      const attendees = note.specificData?.attendees || "";
      const meetingDate = note.specificData?.date
        ? new Date(note.specificData.date).toLocaleString()
        : "";
      const agenda = note.specificData?.agenda || "";
      const actionItems = note.specificData?.actionItems || [];

      // Generar avatares usando DiceBear (iniciales) con degradado
      const attendeeList = attendees
        ? attendees
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a.length > 0)
        : [];

      const avatarUrl = (seed) =>
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          seed || "Guest"
        )}&backgroundType=gradientLinear&radius=50&scale=110&fontSize=38&chars=2`;

      const avatarsHTML = (attendeeList.length ? attendeeList : ["Team"])
        .slice(0, 4)
        .map((name) => {
          const safeName = name || "Team";
          return `<img class="avatar-img" src="${avatarUrl(
            safeName
          )}" alt="${safeName}" title="${safeName}" loading="lazy">`;
        })
        .join("");

      const moreAttendees =
        attendeeList.length > 4
          ? `<div class="avatar-more">+${attendeeList.length - 4}</div>`
          : "";

      return `<div class="note-card meeting-card" data-note-id="${
        note.id
      }" data-size="medium">
        <div class="meeting-header">
          <div class="meeting-title-section">
            <h3 class="meeting-title">${note.title}</h3>
          </div>
          <div class="note-actions">
            <button class="note-action-btn edit-note" title="Edit">✏️</button>
            <button class="note-action-btn delete-note" title="Delete">🗑️</button>
          </div>
        </div>
        
        <div class="attendees-section">
          <div class="avatars-group">
            ${avatarsHTML}
            ${moreAttendees}
          </div>
        </div>
        
        <div class="meeting-content">
          ${
            agenda
              ? `<div class="agenda-section">
            <div class="section-label">AGENDA</div>
            <p class="agenda-text">${agenda}</p>
          </div>`
              : ""
          }
          
          ${
            actionItems.length > 0
              ? `<div class="action-items-section">
            <div class="section-label">ACTION ITEMS</div>
            <ul class="action-items-list">
              ${actionItems
                .slice(0, 3)
                .map((item) => `<li>• ${item}</li>`)
                .join("")}
              ${
                actionItems.length > 3
                  ? `<li>• +${actionItems.length - 3} more items</li>`
                  : ""
              }
            </ul>
          </div>`
              : ""
          }
          
          ${
            note.content
              ? `<div class="meeting-notes"><p>${note.content}</p></div>`
              : ""
          }
        </div>
        
        <div class="note-footer">
          ${meetingDate ? `<div class="note-date">${meetingDate}</div>` : ""}
        </div>
      </div>`;

    default:
      return "";
  }
}

// ============================================
// NAVEGACIÓN Y UI
// ============================================

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Limpiar clases activas
      document
        .querySelectorAll(".nav-item")
        .forEach((nav) => nav.classList.remove("active"));
      document
        .querySelectorAll(".section-content")
        .forEach((section) => section.classList.remove("active"));

      // Activar elementos seleccionados
      item.classList.add("active");
      const sectionId = item.dataset.section + "-section";
      const targetSection = document.getElementById(sectionId);

      if (targetSection) {
        targetSection.classList.add("active");

        // Renderizar contenido según sección
        switch (item.dataset.section) {
          case "tareas":
            renderTasks();
            updateStats();
            break;
          case "tablas":
            renderTasksTable();
            break;
          case "dashboard":
            updateCharts();
            break;
          case "calendario":
            initCalendar();
            updateCalendarEvents();
            break;
          case "notas":
            renderNotes();
            break;
        }

        updateHeader(sectionId);
      }
    });
  });
}

function initFilters() {
  const filterItems = document.querySelectorAll(".filter-btn");

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      filterItems.forEach((button) => button.classList.remove("active"));
      item.classList.add("active");

      // Re-renderizar según sección activa
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
}

// Funcionalidad de búsqueda
function initSearch() {
  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) return;

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    // Añadir indicador de búsqueda
    const searchBar = document.querySelector(".search-bar");
    searchBar.classList.add("searching");

    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();
      performSearch(query);
      searchBar.classList.remove("searching");
    }, 300);
  });
}

function performSearch(query) {
  const activeSection = document.querySelector(".section-content.active");
  if (!activeSection) return;

  switch (activeSection.id) {
    case "tareas-section":
      searchTasks(query);
      break;
    case "tablas-section":
      searchTasksTable(query);
      break;
    case "notas-section":
      searchNotes(query);
      break;
    default:
      break;
  }
}

function searchTasks(query) {
  const taskCards = document.querySelectorAll(".task-card");

  taskCards.forEach((card) => {
    const title =
      card.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const description =
      card.querySelector(".task-description")?.textContent.toLowerCase() || "";

    if (query === "" || title.includes(query) || description.includes(query)) {
      card.style.display = "block";
      highlightSearchTerm(card, query);
    } else {
      card.style.display = "none";
    }
  });
}

function searchTasksTable(query) {
  const rows = document.querySelectorAll("#tasksTableBody tr");

  rows.forEach((row) => {
    if (row.querySelector("td[colspan]")) return; // Skip "no tasks" row

    const title = row.cells[1]?.textContent.toLowerCase() || "";
    const description = row.cells[2]?.textContent.toLowerCase() || "";

    if (query === "" || title.includes(query) || description.includes(query)) {
      row.style.display = "";
      highlightSearchTerm(row, query);
    } else {
      row.style.display = "none";
    }
  });
}

function searchNotes(query) {
  const noteCards = document.querySelectorAll(".note-card");

  noteCards.forEach((card) => {
    const title =
      card.querySelector(".note-title")?.textContent.toLowerCase() || "";
    const content =
      card.querySelector(".note-content")?.textContent.toLowerCase() || "";

    if (query === "" || title.includes(query) || content.includes(query)) {
      card.style.display = "block";
      highlightSearchTerm(card, query);
    } else {
      card.style.display = "none";
    }
  });
}

function highlightSearchTerm(element, query) {
  if (!query) {
    // Remove existing highlights
    element.querySelectorAll("mark").forEach((mark) => {
      mark.outerHTML = mark.innerHTML;
    });
    return;
  }

  const textNodes = getTextNodes(element);
  textNodes.forEach((node) => {
    const text = node.textContent;
    const regex = new RegExp(`(${query})`, "gi");
    if (regex.test(text)) {
      const highlightedHTML = text.replace(regex, "<mark>$1</mark>");
      const wrapper = document.createElement("span");
      wrapper.innerHTML = highlightedHTML;
      node.parentNode.replaceChild(wrapper, node);
    }
  });
}

function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.parentNode.tagName !== "MARK") {
      textNodes.push(node);
    }
  }

  return textNodes;
}

function initModals() {
  const modal = document.getElementById("taskModal");
  const addBtn = document.getElementById("addBtn");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const taskForm = document.getElementById("taskForm");

  // Botón agregar
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const activeSection = document.querySelector(".section-content.active");
      if (activeSection && activeSection.id === "notas-section") {
        openNoteTypeModal();
      } else {
        modal.style.display = "flex";
      }
    });
  }

  // Cerrar modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
      if (taskForm) taskForm.reset();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      if (taskForm) taskForm.reset();
    });
  }

  // Cerrar al hacer clic fuera
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        if (taskForm) taskForm.reset();
      }
    });
  }

  // Submit del formulario
  if (taskForm) {
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(taskForm);
      const taskData = {
        text: formData.get("title"),
        description: formData.get("description") || "",
        priority: formData.get("priority"),
        date: formData.get("date") || "",
      };

      if (taskData.text.trim() === "") return;

      addTask(taskData);

      // Re-renderizar
      const activeSection = document.querySelector(".section-content.active");
      if (activeSection) {
        if (activeSection.id === "tareas-section") {
          renderTasks();
        } else if (activeSection.id === "tablas-section") {
          renderTasksTable();
        }
      }

      updateStats();
      updateCharts();

      taskForm.reset();
      modal.style.display = "none";
    });
  }
}

function initDrawer() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!hamburgerBtn || !sidebar || !overlay) return;

  function toggleDrawer() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
  }

  hamburgerBtn.addEventListener("click", toggleDrawer);
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    hamburgerBtn.classList.remove("active");
  });

  // Cerrar drawer en móvil al seleccionar navegación
  const navItems = sidebar.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        setTimeout(() => {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
          hamburgerBtn.classList.remove("active");
        }, 150);
      }
    });
  });
}

function updateHeader(sectionId) {
  const searchInput = document.querySelector(".search-bar input");
  const addActionBtn = document.getElementById("addBtn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const header = document.querySelector(".header");

  // Limpiar búsqueda anterior
  if (searchInput) {
    searchInput.value = "";
  }
  clearSearchHighlights();

  // Resetear filtros
  filterButtons.forEach((btn) => {
    btn.style.display = "inline-flex";
  });

  switch (sectionId) {
    case "dashboard-section":
      // Ocultar header completo en dashboard
      if (header) header.style.display = "none";
      break;

    case "tablas-section":
    case "tareas-section":
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar tareas...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Añadir Tarea";
      }
      break;

    case "calendario-section":
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar eventos...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nuevo Evento";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    case "notas-section":
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar notas...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Nueva Nota";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
      break;

    default:
      if (header) header.style.display = "flex";
      if (searchInput) searchInput.placeholder = "Buscar...";
      if (addActionBtn && addActionBtn.querySelector("span")) {
        addActionBtn.querySelector("span").textContent = "Agregar";
      }
      filterButtons.forEach((btn) => (btn.style.display = "none"));
  }
}

function clearSearchHighlights() {
  document.querySelectorAll("mark").forEach((mark) => {
    mark.outerHTML = mark.innerHTML;
  });

  // Mostrar todos los elementos ocultos por búsqueda
  document
    .querySelectorAll(".task-card, #tasksTableBody tr, .note-card")
    .forEach((element) => {
      element.style.display = "";
    });
}

// ============================================
// FUNCIONES DE NOTAS MODALES
// ============================================

function openNoteTypeModal() {
  const modal = document.getElementById("noteTypeModal");
  if (modal) modal.style.display = "flex";
}

function initNoteModals() {
  // Note Type Modal
  const noteTypeModal = document.getElementById("noteTypeModal");
  const closeNoteTypeModal = document.getElementById("closeNoteTypeModal");
  const cancelNoteType = document.getElementById("cancelNoteType");
  const noteTypeOptions = document.querySelectorAll(".note-type-option");

  function closeNoteTypeModalFunc() {
    if (noteTypeModal) noteTypeModal.style.display = "none";
  }

  if (closeNoteTypeModal)
    closeNoteTypeModal.addEventListener("click", closeNoteTypeModalFunc);
  if (cancelNoteType)
    cancelNoteType.addEventListener("click", closeNoteTypeModalFunc);
  if (noteTypeModal) {
    noteTypeModal.addEventListener("click", (e) => {
      if (e.target === noteTypeModal) closeNoteTypeModalFunc();
    });
  }

  noteTypeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const noteType = option.dataset.type;
      closeNoteTypeModalFunc();
      openSpecificNoteModal(noteType);
    });
  });

  // Standard Note Modal
  const standardModal = document.getElementById("standardNoteModal");
  const standardForm = document.getElementById("standardNoteForm");
  const closeStandardNote = document.getElementById("closeStandardNote");
  const cancelStandardNote = document.getElementById("cancelStandardNote");

  function closeStandardModalFunc() {
    if (standardModal) standardModal.style.display = "none";
    if (standardForm) standardForm.reset();
    window.editingNoteId = null;
  }

  if (closeStandardNote)
    closeStandardNote.addEventListener("click", closeStandardModalFunc);
  if (cancelStandardNote)
    cancelStandardNote.addEventListener("click", closeStandardModalFunc);
  if (standardModal) {
    standardModal.addEventListener("click", (e) => {
      if (e.target === standardModal) closeStandardModalFunc();
    });
  }

  if (standardForm) {
    standardForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const tags = document
        .getElementById("standardTags")
        .value.split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const noteData = {
        type: "standard",
        title: document.getElementById("standardTitle").value,
        content: document.getElementById("standardContent").value,
        specificData: { tags },
      };

      if (window.editingNoteId) {
        updateNote(window.editingNoteId, noteData);
        window.editingNoteId = null;
      } else {
        createNote(noteData);
      }

      closeStandardModalFunc();
    });
  }

  // Sticky Note Modal
  const stickyModal = document.getElementById("stickyModal");
  const stickyForm = document.getElementById("stickyForm");
  const closeSticky = document.getElementById("closeSticky");
  const cancelSticky = document.getElementById("cancelSticky");

  function closeStickyModalFunc() {
    if (stickyModal) stickyModal.style.display = "none";
    if (stickyForm) stickyForm.reset();
    window.editingNoteId = null;
  }

  if (closeSticky) closeSticky.addEventListener("click", closeStickyModalFunc);
  if (cancelSticky)
    cancelSticky.addEventListener("click", closeStickyModalFunc);
  if (stickyModal) {
    stickyModal.addEventListener("click", (e) => {
      if (e.target === stickyModal) closeStickyModalFunc();
    });
  }

  if (stickyForm) {
    stickyForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const selectedColor =
        document.querySelector('input[name="stickyColor"]:checked')?.value ||
        "yellow";
      const colorMap = {
        yellow: "#fef3c7",
        pink: "#fce7f3",
        blue: "#dbeafe",
        green: "#d1fae5",
      };

      const noteData = {
        type: "sticky",
        title: "",
        content: document.getElementById("stickyContent").value,
        color: colorMap[selectedColor] || "#fef3c7",
      };

      if (window.editingNoteId) {
        updateNote(window.editingNoteId, noteData);
        window.editingNoteId = null;
      } else {
        createNote(noteData);
      }

      closeStickyModalFunc();
    });
  }

  // Checklist Note Modal
  const checklistModal = document.getElementById("checklistModal");
  const checklistForm = document.getElementById("checklistForm");
  const closeChecklist = document.getElementById("closeChecklist");
  const cancelChecklist = document.getElementById("cancelChecklist");

  function closeChecklistModalFunc() {
    if (checklistModal) checklistModal.style.display = "none";
    if (checklistForm) checklistForm.reset();
    // Limpiar items del checklist
    const container = document.getElementById("checklistItems");
    if (container)
      container.innerHTML =
        '<div class="checklist-item"><input type="text" placeholder="New item..." required /><button type="button" class="remove-item">&times;</button></div>';
    window.editingNoteId = null;
  }

  if (closeChecklist)
    closeChecklist.addEventListener("click", closeChecklistModalFunc);
  if (cancelChecklist)
    cancelChecklist.addEventListener("click", closeChecklistModalFunc);
  if (checklistModal) {
    checklistModal.addEventListener("click", (e) => {
      if (e.target === checklistModal) closeChecklistModalFunc();
    });
  }

  // Funcionalidad para añadir/remover items del checklist
  const addChecklistItemBtn = document.getElementById("addChecklistItem");
  const checklistItemsContainer = document.getElementById("checklistItems");

  function addChecklistItem() {
    const itemDiv = document.createElement("div");
    itemDiv.className = "checklist-item";
    itemDiv.innerHTML = `
      <input type="text" placeholder="New item..." required />
      <button type="button" class="remove-item">&times;</button>
    `;

    // Agregar event listener para el botón de remover
    const removeBtn = itemDiv.querySelector(".remove-item");
    removeBtn.addEventListener("click", () => {
      itemDiv.remove();
    });

    checklistItemsContainer.appendChild(itemDiv);

    // Focus en el nuevo input
    const newInput = itemDiv.querySelector("input");
    newInput.focus();
  }

  function removeChecklistItem(button) {
    const item = button.closest(".checklist-item");
    if (checklistItemsContainer.children.length > 1) {
      item.remove();
    }
  }

  if (addChecklistItemBtn) {
    addChecklistItemBtn.addEventListener("click", addChecklistItem);
  }

  // Event delegation para botones de remover existentes y futuros
  if (checklistItemsContainer) {
    checklistItemsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        removeChecklistItem(e.target);
      }
    });
  }

  // Handler para el formulario de checklist
  if (checklistForm) {
    checklistForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const items = [];
      const inputs = checklistItemsContainer.querySelectorAll(
        ".checklist-item input"
      );
      inputs.forEach((input) => {
        if (input.value.trim()) {
          items.push({
            text: input.value.trim(),
            checked: input.dataset.checked === "true",
          });
        }
      });

      const noteData = {
        type: "checklist",
        title: document.getElementById("checklistTitle").value,
        content: "",
        specificData: {
          items: items,
        },
      };

      if (window.editingNoteId) {
        updateNote(window.editingNoteId, noteData);
        window.editingNoteId = null;
      } else {
        createNote(noteData);
      }

      closeChecklistModalFunc();
    });
  }

  // Idea Note Modal
  const ideaModal = document.getElementById("ideaModal");
  const ideaForm = document.getElementById("ideaForm");
  const closeIdea = document.getElementById("closeIdea");
  const cancelIdea = document.getElementById("cancelIdea");

  function closeIdeaModalFunc() {
    if (ideaModal) ideaModal.style.display = "none";
    if (ideaForm) ideaForm.reset();
    window.editingNoteId = null;
  }

  if (closeIdea) closeIdea.addEventListener("click", closeIdeaModalFunc);
  if (cancelIdea) cancelIdea.addEventListener("click", closeIdeaModalFunc);
  if (ideaModal) {
    ideaModal.addEventListener("click", (e) => {
      if (e.target === ideaModal) closeIdeaModalFunc();
    });
  }

  // Handler para el formulario de idea
  if (ideaForm) {
    ideaForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const keyPointsValue = document.getElementById("ideaKeyPoints").value;
      const keyPoints = keyPointsValue
        ? keyPointsValue.split("\n").filter((point) => point.trim())
        : [];

      const noteData = {
        type: "idea",
        title: document.getElementById("ideaTitle").value,
        content: document.getElementById("ideaDescription").value,
        specificData: {
          potential: document.getElementById("ideaPotential").value,
          keyPoints: keyPoints,
        },
      };

      if (window.editingNoteId) {
        updateNote(window.editingNoteId, noteData);
        window.editingNoteId = null;
      } else {
        createNote(noteData);
      }

      closeIdeaModalFunc();
    });
  }

  // Meeting Note Modal
  const meetingModal = document.getElementById("meetingModal");
  const meetingForm = document.getElementById("meetingForm");
  const closeMeeting = document.getElementById("closeMeeting");
  const cancelMeeting = document.getElementById("cancelMeeting");

  function closeMeetingModalFunc() {
    if (meetingModal) meetingModal.style.display = "none";
    if (meetingForm) meetingForm.reset();
    window.editingNoteId = null;
  }

  if (closeMeeting)
    closeMeeting.addEventListener("click", closeMeetingModalFunc);
  if (cancelMeeting)
    cancelMeeting.addEventListener("click", closeMeetingModalFunc);
  if (meetingModal) {
    meetingModal.addEventListener("click", (e) => {
      if (e.target === meetingModal) closeMeetingModalFunc();
    });
  }

  // Handler para el formulario de meeting
  if (meetingForm) {
    meetingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const actionItemsText = document.getElementById("meetingActions").value;
      // Procesar action items - separar por líneas y limpiar bullets
      const actionItems = actionItemsText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => item.replace(/^[•\-\*]\s*/, "")) // Remover bullets
        .map((item) => item.replace(/^@[\w\s]+:\s*/, "")); // Remover menciones con espacios

      const noteData = {
        type: "meeting",
        title: document.getElementById("meetingTitle").value,
        content: document.getElementById("meetingNotes").value,
        specificData: {
          date: document.getElementById("meetingDate").value,
          attendees: document.getElementById("meetingAttendees").value,
          agenda: document.getElementById("meetingAgenda").value,
          actionItems: actionItems,
        },
      };

      if (window.editingNoteId) {
        updateNote(window.editingNoteId, noteData);
        window.editingNoteId = null;
      } else {
        createNote(noteData);
      }

      closeMeetingModalFunc();
    });
  }
}

function openSpecificNoteModal(noteType) {
  const modals = {
    standard: document.getElementById("standardNoteModal"),
    checklist: document.getElementById("checklistModal"),
    idea: document.getElementById("ideaModal"),
    meeting: document.getElementById("meetingModal"),
    sticky: document.getElementById("stickyModal"),
  };

  const modal = modals[noteType];
  if (modal) modal.style.display = "flex";
}

// ============================================
// FUNCIONES DE GESTIÓN DE NOTAS
// ============================================

function deleteNote(noteId) {
  const notes = getNotes();
  const updatedNotes = notes.filter((note) => note.id !== noteId);
  saveNotes(updatedNotes);
  renderNotes();
}

function deleteNoteWithConfirmation(noteId) {
  const notes = getNotes();
  const note = notes.find((n) => n.id === noteId);
  if (!note) return;

  const noteTitle =
    note.title ||
    note.content.substring(0, 30) + (note.content.length > 30 ? "..." : "");

  showConfirmation({
    title: "Eliminar nota",
    message: `¿Estás seguro de que deseas eliminar "${noteTitle}"?`,
    type: "delete",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    onConfirm: () => {
      deleteNote(noteId);
    },
  });
}

function toggleChecklistItem(noteId, itemIndex) {
  const notes = getNotes();
  const note = notes.find((n) => n.id === noteId);
  if (!note || note.type !== "checklist" || !note.specificData?.items) return;

  // Toggle el estado checked del item
  if (note.specificData.items[itemIndex]) {
    note.specificData.items[itemIndex].checked =
      !note.specificData.items[itemIndex].checked;

    // Guardar cambios
    saveNotes(notes);

    // Re-renderizar solo esta nota para actualizar visualmente
    renderNotes();
  }
}

function editNote(noteId) {
  const notes = getNotes();
  const note = notes.find((n) => n.id === noteId);
  if (!note) return;

  // Abrir el modal específico para el tipo de nota
  openSpecificNoteModal(note.type);

  // Llenar los campos con los datos existentes
  populateNoteModal(note);
}

function populateNoteModal(note) {
  // Guardar el ID de la nota que se está editando
  window.editingNoteId = note.id;

  switch (note.type) {
    case "standard":
      document.getElementById("standardTitle").value = note.title || "";
      document.getElementById("standardContent").value = note.content || "";
      if (note.specificData?.tags) {
        document.getElementById("standardTags").value =
          note.specificData.tags.join(", ");
      }
      break;

    case "sticky":
      document.getElementById("stickyContent").value = note.content || "";
      // Seleccionar el color correspondiente
      const colorMap = {
        "#fef3c7": "yellow",
        "#fce7f3": "pink",
        "#dbeafe": "blue",
        "#d1fae5": "green",
      };
      const colorValue = colorMap[note.color] || "yellow";
      const colorRadio = document.querySelector(
        `input[name="stickyColor"][value="${colorValue}"]`
      );
      if (colorRadio) colorRadio.checked = true;
      break;

    case "checklist":
      document.getElementById("checklistTitle").value = note.title || "";
      // Poblar items del checklist
      const container = document.getElementById("checklistItems");
      container.innerHTML = "";
      if (note.specificData?.items) {
        note.specificData.items.forEach((item) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "checklist-item";
          itemDiv.innerHTML = `
            <input type="text" value="${item.text}" required ${
            item.checked ? 'data-checked="true"' : ""
          } />
            <button type="button" class="remove-item">&times;</button>
          `;

          const removeBtn = itemDiv.querySelector(".remove-item");
          removeBtn.addEventListener("click", () => itemDiv.remove());

          container.appendChild(itemDiv);
        });
      }
      break;

    case "idea":
      document.getElementById("ideaTitle").value = note.title || "";
      document.getElementById("ideaDescription").value = note.content || "";
      if (note.specificData?.potential) {
        document.getElementById("ideaPotential").value =
          note.specificData.potential;
      }
      if (note.specificData?.keyPoints) {
        document.getElementById("ideaKeyPoints").value =
          note.specificData.keyPoints.join("\n");
      }
      break;

    case "meeting":
      document.getElementById("meetingTitle").value = note.title || "";
      if (note.specificData?.date) {
        document.getElementById("meetingDate").value = note.specificData.date;
      }
      if (note.specificData?.attendees) {
        document.getElementById("meetingAttendees").value =
          note.specificData.attendees;
      }
      if (note.specificData?.agenda) {
        document.getElementById("meetingAgenda").value =
          note.specificData.agenda;
      }
      document.getElementById("meetingNotes").value = note.content || "";
      if (note.specificData?.actionItems) {
        document.getElementById("meetingActions").value =
          note.specificData.actionItems.join("\n");
      }
      break;
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

function initApp() {
  console.log("Iniciando TaskMaster...");

  // Inicializar componentes
  initNavigation();
  initFilters();
  initModals();
  initDrawer();
  initNoteModals();
  initSearch();

  // Inicializar charts
  initCharts();

  // Renderizar contenido inicial
  renderTasks();
  updateStats();

  console.log("TaskMaster inicializado correctamente");
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initApp);
