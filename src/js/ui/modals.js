/**
 * UI/Modals Module
 * Handles all UI interactions, modals, and event management
 */

import * as NotesLogic from "../notes/logic.js";
import * as NotesUI from "../notes/ui.js";
import { NOTE_TYPES } from "../shared/constants.js";

// Global state for editing
window.editingNoteId = null;

/**
 * Open note type selection modal
 */
export function openNoteTypeModal() {
  const modal = document.getElementById("noteTypeModal");
  if (modal) modal.style.display = "flex";
}

/**
 * Open specific note modal by type
 */
export function openSpecificNoteModal(noteType) {
  const modals = {
    standard: "standardNoteModal",
    checklist: "checklistModal",
    idea: "ideaModal",
    meeting: "meetingModal",
    sticky: "stickyModal",
  };

  const modalId = modals[noteType];
  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "flex";
  }
}

/**
 * Initialize all note modals
 */
export function initNoteModals() {
  initNoteTypeModal();
  initStandardNoteModal();
  initStickyNoteModal();
  initChecklistNoteModal();
  initIdeaNoteModal();
  initMeetingNoteModal();
}

/**
 * Initialize note type selection modal
 */
function initNoteTypeModal() {
  const modal = document.getElementById("noteTypeModal");
  const closeBtn = document.getElementById("closeNoteTypeModal");
  const cancelBtn = document.getElementById("cancelNoteType");
  const options = document.querySelectorAll(".note-type-option");

  const closeModal = () => {
    if (modal) modal.style.display = "none";
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const noteType = option.dataset.type;
      closeModal();
      openSpecificNoteModal(noteType);
    });
  });
}

/**
 * Initialize standard note modal
 */
function initStandardNoteModal() {
  const modal = document.getElementById("standardNoteModal");
  const form = document.getElementById("standardNoteForm");
  const closeBtn = document.getElementById("closeStandardNote");
  const cancelBtn = document.getElementById("cancelStandardNote");

  const closeModal = () => {
    if (modal) modal.style.display = "none";
    if (form) form.reset();
    window.editingNoteId = null;
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const tags = document
        .getElementById("standardTags")
        .value.split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const noteData = {
        type: NOTE_TYPES.STANDARD,
        title: document.getElementById("standardTitle").value,
        content: document.getElementById("standardContent").value,
        specificData: { tags },
      };

      if (window.editingNoteId) {
        NotesLogic.updateNote(window.editingNoteId, noteData);
      } else {
        NotesLogic.createNote(noteData);
      }

      NotesUI.renderNotes();
      closeModal();
    });
  }
}

/**
 * Initialize sticky note modal
 */
function initStickyNoteModal() {
  const modal = document.getElementById("stickyModal");
  const form = document.getElementById("stickyForm");
  const closeBtn = document.getElementById("closeSticky");
  const cancelBtn = document.getElementById("cancelSticky");

  const closeModal = () => {
    if (modal) modal.style.display = "none";
    if (form) form.reset();
    window.editingNoteId = null;
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
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
        type: NOTE_TYPES.STICKY,
        title: "",
        content: document.getElementById("stickyContent").value,
        color: colorMap[selectedColor] || "#fef3c7",
      };

      if (window.editingNoteId) {
        NotesLogic.updateNote(window.editingNoteId, noteData);
      } else {
        NotesLogic.createNote(noteData);
      }

      NotesUI.renderNotes();
      closeModal();
    });
  }
}

/**
 * Initialize checklist note modal
 */
function initChecklistNoteModal() {
  const modal = document.getElementById("checklistModal");
  const form = document.getElementById("checklistForm");
  const closeBtn = document.getElementById("closeChecklist");
  const cancelBtn = document.getElementById("cancelChecklist");
  const addBtn = document.getElementById("addChecklistItem");
  const itemsContainer = document.getElementById("checklistItems");

  const closeModal = () => {
    if (modal) modal.style.display = "none";
    if (form) form.reset();
    if (itemsContainer) {
      itemsContainer.innerHTML =
        '<div class="checklist-item"><input type="text" placeholder="New item..." required /><button type="button" class="remove-item">&times;</button></div>';
    }
    window.editingNoteId = null;
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", addChecklistItemField);
  }

  if (itemsContainer) {
    itemsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        const item = e.target.closest(".checklist-item");
        if (itemsContainer.children.length > 1) {
          item.remove();
        }
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const items = [];
      const inputs = itemsContainer.querySelectorAll(".checklist-item input");
      inputs.forEach((input) => {
        if (input.value.trim()) {
          items.push({
            text: input.value.trim(),
            checked: input.dataset.checked === "true",
          });
        }
      });

      const noteData = {
        type: NOTE_TYPES.CHECKLIST,
        title: document.getElementById("checklistTitle").value,
        content: "",
        specificData: { items },
      };

      if (window.editingNoteId) {
        NotesLogic.updateNote(window.editingNoteId, noteData);
      } else {
        NotesLogic.createNote(noteData);
      }

      NotesUI.renderNotes();
      closeModal();
    });
  }
}

/**
 * Add a new checklist item field
 */
function addChecklistItemField() {
  const container = document.getElementById("checklistItems");
  if (!container) return;

  const itemDiv = document.createElement("div");
  itemDiv.className = "checklist-item";
  itemDiv.innerHTML = `
    <input type="text" placeholder="New item..." required />
    <button type="button" class="remove-item">&times;</button>
  `;

  const removeBtn = itemDiv.querySelector(".remove-item");
  removeBtn.addEventListener("click", () => {
    if (container.children.length > 1) {
      itemDiv.remove();
    }
  });

  container.appendChild(itemDiv);
  const input = itemDiv.querySelector("input");
  input.focus();
}

/**
 * Initialize idea note modal
 */
function initIdeaNoteModal() {
  const modal = document.getElementById("ideaModal");
  const form = document.getElementById("ideaForm");
  const closeBtn = document.getElementById("closeIdea");
  const cancelBtn = document.getElementById("cancelIdea");

  const closeModal = () => {
    if (modal) modal.style.display = "none";
    if (form) form.reset();
    window.editingNoteId = null;
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const keyPointsValue = document.getElementById("ideaKeyPoints").value;
      const keyPoints = keyPointsValue
        ? keyPointsValue.split("\n").filter((point) => point.trim())
        : [];

      const noteData = {
        type: NOTE_TYPES.IDEA,
        title: document.getElementById("ideaTitle").value,
        content: document.getElementById("ideaDescription").value,
        specificData: {
          potential: document.getElementById("ideaPotential").value,
          keyPoints,
        },
      };

      if (window.editingNoteId) {
        NotesLogic.updateNote(window.editingNoteId, noteData);
      } else {
        NotesLogic.createNote(noteData);
      }

      NotesUI.renderNotes();
      closeModal();
    });
  }
}

/**
 * Initialize meeting note modal
 */
function initMeetingNoteModal() {
  const modal = document.getElementById("meetingModal");
  const form = document.getElementById("meetingForm");
  const closeBtn = document.getElementById("closeMeeting");
  const cancelBtn = document.getElementById("cancelMeeting");

  const closeModal = () => {
    if (modal) modal.style.display = "none";
    if (form) form.reset();
    window.editingNoteId = null;
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const actionItemsText =
        document.getElementById("meetingActions").value;
      const actionItems = actionItemsText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => item.replace(/^[•\-\*]\s*/, ""))
        .map((item) => item.replace(/^@[\w\s]+:\s*/, ""));

      const noteData = {
        type: NOTE_TYPES.MEETING,
        title: document.getElementById("meetingTitle").value,
        content: document.getElementById("meetingNotes").value,
        specificData: {
          date: document.getElementById("meetingDate").value,
          attendees: document.getElementById("meetingAttendees").value,
          agenda: document.getElementById("meetingAgenda").value,
          actionItems,
        },
      };

      if (window.editingNoteId) {
        NotesLogic.updateNote(window.editingNoteId, noteData);
      } else {
        NotesLogic.createNote(noteData);
      }

      NotesUI.renderNotes();
      closeModal();
    });
  }
}

/**
 * Edit existing note
 */
export function editNote(noteId) {
  const note = NotesLogic.getNoteById(noteId);
  if (!note) return;

  openSpecificNoteModal(note.type);
  populateNoteModal(note);
}

/**
 * Populate modal fields with note data
 */
function populateNoteModal(note) {
  window.editingNoteId = note.id;

  switch (note.type) {
    case NOTE_TYPES.STANDARD:
      document.getElementById("standardTitle").value = note.title || "";
      document.getElementById("standardContent").value = note.content || "";
      if (note.specificData?.tags) {
        document.getElementById("standardTags").value =
          note.specificData.tags.join(", ");
      }
      break;

    case NOTE_TYPES.STICKY:
      document.getElementById("stickyContent").value = note.content || "";
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

    case NOTE_TYPES.CHECKLIST:
      document.getElementById("checklistTitle").value = note.title || "";
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
          removeBtn.addEventListener("click", () => {
            if (container.children.length > 1) {
              itemDiv.remove();
            }
          });

          container.appendChild(itemDiv);
        });
      }
      break;

    case NOTE_TYPES.IDEA:
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

    case NOTE_TYPES.MEETING:
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

/**
 * Listen to editNote custom events from notes UI
 */
document.addEventListener("editNote", (e) => {
  editNote(e.detail.noteId);
});
