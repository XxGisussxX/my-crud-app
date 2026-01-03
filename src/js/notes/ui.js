/**
 * Notes UI Module
 * Rendering and DOM management for notes
 */

import {
  getAllNotes,
  getNoteById,
  deleteNote,
  getContentSize,
  getChecklistProgress,
  toggleChecklistItem,
  searchNotes,
} from "./logic.js";
import { NOTE_TYPES } from "../shared/constants.js";
import { formatDate, escapeHtml } from "../shared/utils.js";
import { showConfirmation } from "../shared/confirmation.js";

/**
 * Render all notes
 */
export function renderNotes() {
  const container = document.getElementById("notasGrid");
  if (!container) return;

  const notes = getAllNotes();
  if (notes.length === 0) {
    container.innerHTML = `
      <div class="no-notes">
        <div class="no-notes-icon">📝</div>
        <h3>No hay notas</h3>
        <p>¡Crea tu primera nota!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map((note) => renderNoteCard(note)).join("");
  attachNoteEventListeners(container);
}

/**
 * Create and render a note card
 */
export function renderNoteCard(note) {
  const formattedDate = formatDate(note.createdAt);
  const size = getContentSize(note.type, note.content, note.specificData);

  switch (note.type) {
    case NOTE_TYPES.STANDARD:
      return renderStandardNote(note, formattedDate, size);
    case NOTE_TYPES.STICKY:
      return renderStickyNote(note, formattedDate, size);
    case NOTE_TYPES.CHECKLIST:
      return renderChecklistNote(note, formattedDate, size);
    case NOTE_TYPES.IDEA:
      return renderIdeaNote(note, formattedDate, size);
    case NOTE_TYPES.MEETING:
      return renderMeetingNote(note, formattedDate, size);
    default:
      return "";
  }
}

/**
 * Render standard note card
 */
function renderStandardNote(note, formattedDate, size) {
  const tags = note.specificData?.tags || [];

  return `
    <div class="note-card" style="background-color: ${
      note.color
    }" data-note-id="${note.id}" data-size="${size}">
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <button class="note-action-btn edit-note" title="Editar">✏️</button>
          <button class="note-action-btn delete-note" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div class="note-content"><p>${escapeHtml(note.content || "")}</p></div>
      <div class="note-footer">
        <div class="note-tags">
          ${tags
            .map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`)
            .join("")}
        </div>
        <div class="note-date">${formattedDate}</div>
      </div>
    </div>
  `;
}

/**
 * Render sticky note card
 */
function renderStickyNote(note, formattedDate, size) {
  return `
    <div class="note-card sticky-card" style="background-color: ${
      note.color
    }" data-note-id="${note.id}" data-size="${size}">
      <div class="note-actions">
        <button class="note-action-btn edit-note" title="Editar">✏️</button>
        <button class="note-action-btn delete-note" title="Eliminar">🗑️</button>
      </div>
      <div class="sticky-content"><p>${escapeHtml(note.content)}</p></div>
      <div class="sticky-pin">📌</div>
      <div class="note-date">${formattedDate}</div>
    </div>
  `;
}

/**
 * Render checklist note card
 */
function renderChecklistNote(note, formattedDate, size) {
  const items = Array.isArray(note.specificData?.items)
    ? note.specificData.items
    : [];
  const progress = getChecklistProgress(note.id);
  const progressPercentage = progress?.percentage || 0;

  const itemsHtml = items
    .map(
      (item, index) => `
    <div class="checklist-item-preview ${
      item.checked ? "checked" : ""
    }" data-item-index="${index}">
      <span class="checkmark">${item.checked ? "✓" : "○"}</span>
      <span class="item-text">${escapeHtml(item.text)}</span>
    </div>
  `
    )
    .slice(0, 3)
    .join("");

  const moreItems =
    items.length > 3
      ? `<div class="more-items">+${items.length - 3} más...</div>`
      : "";

  return `
    <div class="note-card checklist-card" data-note-id="${
      note.id
    }" data-size="${size}">
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <button class="note-action-btn edit-note" title="Editar">✏️</button>
          <button class="note-action-btn delete-note" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div class="note-content">
        <div class="checklist-items">
          ${itemsHtml}
          ${moreItems}
        </div>
      </div>
      <div class="checklist-progress" style="background: rgba(0,0,0,0.05); padding: 8px; border-radius: 8px; font-size: 12px; text-align: center; color: #6b7280;">
        ${progress?.completed}/${
    progress?.total
  } completados (${progressPercentage}%)
      </div>
      <div class="note-date">${formattedDate}</div>
    </div>
  `;
}

/**
 * Render idea note card
 */
function renderIdeaNote(note, formattedDate, size) {
  const potential = note.specificData?.potential || "medium";
  const keyPoints = Array.isArray(note.specificData?.keyPoints)
    ? note.specificData.keyPoints
    : [];

  const potentialBadge = `<div class="idea-potential ${potential}">${potential.toUpperCase()}</div>`;

  const keyPointsHtml = keyPoints
    .slice(0, 2)
    .map((point) => `<div class="key-point">${escapeHtml(point)}</div>`)
    .join("");

  const morePoints =
    keyPoints.length > 2
      ? `<div class="key-point" style="color: #9ca3af;">+${
          keyPoints.length - 2
        } más puntos...</div>`
      : "";

  return `
    <div class="note-card idea-card" data-note-id="${
      note.id
    }" data-size="${size}">
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <button class="note-action-btn edit-note" title="Editar">✏️</button>
          <button class="note-action-btn delete-note" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div class="note-content">
        ${potentialBadge}
        <p class="idea-description">${escapeHtml(note.content)}</p>
        <div class="key-points">
          ${keyPointsHtml}
          ${morePoints}
        </div>
      </div>
      <div class="note-date">${formattedDate}</div>
    </div>
  `;
}

/**
 * Render meeting note card
 */
function renderMeetingNote(note, formattedDate, size) {
  const attendees = Array.isArray(note.specificData?.attendees)
    ? note.specificData.attendees
    : [];
  const agenda = note.specificData?.agenda || "";
  const actionItems = Array.isArray(note.specificData?.actionItems)
    ? note.specificData.actionItems
    : [];

  // Generate avatar colors based on name
  const getAvatarColor = (name) => {
    const colors = [
      "3b82f6",
      "8b5cf6",
      "ec4899",
      "f59e0b",
      "10b981",
      "ef4444",
      "06b6d4",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarHtml = attendees
    .slice(0, 5)
    .map((attendee) => {
      const name = encodeURIComponent(attendee);
      const color = getAvatarColor(attendee);
      return `<img class="avatar" src="https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&size=128&bold=true" alt="${attendee}" title="${attendee}" />`;
    })
    .join("");

  const moreAttendees =
    attendees.length > 5
      ? `<div class="avatar-more" title="${attendees.slice(5).join(", ")}">+${
          attendees.length - 5
        }</div>`
      : "";

  const actionItemsHtml = actionItems
    .slice(0, 2)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <div class="note-card meeting-card" data-note-id="${
      note.id
    }" data-size="${size}">
      <div class="meeting-header">
        <div class="meeting-title-section">
          <h3 class="meeting-title">${escapeHtml(note.title)}</h3>
        </div>
        <div class="note-actions">
          <button class="note-action-btn edit-note" title="Editar">✏️</button>
          <button class="note-action-btn delete-note" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div class="meeting-content">
        <div class="attendees-section">
          <div class="avatars-group">
            ${avatarHtml}
            ${moreAttendees}
          </div>
        </div>
        ${
          agenda
            ? `<div class="agenda-section">
              <div class="section-label">Agenda</div>
              <div class="agenda-text">${escapeHtml(agenda)}</div>
            </div>`
            : ""
        }
        ${
          actionItems.length > 0
            ? `<div class="action-items-section">
              <div class="section-label">Acción</div>
              <ul class="action-items-list">
                ${actionItemsHtml}
                ${
                  actionItems.length > 2
                    ? `<li>+${actionItems.length - 2} más...</li>`
                    : ""
                }
              </ul>
            </div>`
            : ""
        }
      </div>
      <div class="note-date">${formattedDate}</div>
    </div>
  `;
}

/**
 * Attach event listeners to note cards
 */
function attachNoteEventListeners(container) {
  if (container.dataset.listenerAdded === "true") return;

  container.addEventListener("click", (e) => {
    const noteCard = e.target.closest(".note-card");
    if (!noteCard) return;

    const noteId = noteCard.dataset.noteId;
    if (!noteId) return;

    if (e.target.classList.contains("edit-note")) {
      editNote(noteId);
    } else if (e.target.classList.contains("delete-note")) {
      deleteNoteWithConfirmation(noteId);
    } else if (e.target.closest(".checklist-item-preview")) {
      const itemPreview = e.target.closest(".checklist-item-preview");
      const itemIndex = parseInt(itemPreview.dataset.itemIndex);
      if (!isNaN(itemIndex)) {
        toggleChecklistItem(noteId, itemIndex);
        renderNotes();
      }
    }
  });

  container.dataset.listenerAdded = "true";
}

/**
 * Delete note with confirmation
 */
export function deleteNoteWithConfirmation(noteId) {
  const note = getNoteById(noteId);
  if (!note) return;

  showConfirmation({
    title: "Eliminar nota",
    message: `¿Estás seguro de que deseas eliminar la nota "${
      note.title || "Sin título"
    }"?`,
    type: "delete",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    onConfirm: () => {
      deleteNote(noteId);
      renderNotes();
    },
  });
}

/**
 * Search and highlight notes
 */
export function searchAndRenderNotes(query) {
  const container = document.getElementById("notasGrid");
  if (!container) return;

  if (!query.trim()) {
    renderNotes();
    return;
  }

  const results = searchNotes(query);

  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>No se encontraron notas para: "${escapeHtml(query)}"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map((note) => renderNoteCard(note)).join("");
  attachNoteEventListeners(container);
}

/**
 * Placeholder functions that reference main.js implementations
 */
export function editNote(noteId) {
  // This function will call the modal system from main.js
  const event = new CustomEvent("editNote", { detail: { noteId } });
  document.dispatchEvent(event);
}

/**
 * Highlight text in notes
 */
export function highlightNoteResults(query) {
  const cards = document.querySelectorAll(".note-card");
  const lowerQuery = query.toLowerCase();

  cards.forEach((card) => {
    const title = card.querySelector(".note-title");
    const content = card.querySelector(".note-content");

    let matches = false;

    if (title && title.textContent.toLowerCase().includes(lowerQuery)) {
      highlightText(title, query);
      matches = true;
    }

    if (content && content.textContent.toLowerCase().includes(lowerQuery)) {
      highlightText(content, query);
      matches = true;
    }

    card.style.display = matches ? "block" : "none";
  });
}

/**
 * Helper: Highlight text with mark tags
 */
function highlightText(element, query) {
  const text = element.textContent;
  const regex = new RegExp(`(${query})`, "gi");
  element.innerHTML = text.replace(regex, "<mark>$1</mark>");
}
