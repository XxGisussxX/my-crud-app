/**
 * Notes Logic Module
 * Core business logic for note management
 */

import { getNotes, saveNotes } from "../shared/storage.js";
import { generateId, formatDateISO, cloneObject } from "../shared/utils.js";
import { NOTE_TYPES, STICKY_COLORS } from "../shared/constants.js";

/**
 * Create a new note
 */
export function createNote(noteData) {
  const notes = getNotes();
  const newNote = {
    id: generateId(),
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
  return newNote;
}

/**
 * Update an existing note
 */
export function updateNote(noteId, updateData) {
  const notes = getNotes();
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex === -1) return null;

  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updateData,
    ...(updateData.specificData && { specificData: updateData.specificData }),
    updatedAt: new Date().toISOString(),
  };

  saveNotes(notes);
  return notes[noteIndex];
}

/**
 * Delete a note
 */
export function deleteNote(noteId) {
  const notes = getNotes();
  const filtered = notes.filter((note) => note.id !== noteId);
  saveNotes(filtered);
  return filtered;
}

/**
 * Get note by ID
 */
export function getNoteById(noteId) {
  const notes = getNotes();
  return notes.find((note) => note.id === noteId);
}

/**
 * Get all notes
 */
export function getAllNotes() {
  return getNotes();
}

/**
 * Get notes by type
 */
export function getNotesByType(type) {
  const notes = getNotes();
  return notes.filter((note) => note.type === type);
}

/**
 * Search notes
 */
export function searchNotes(query) {
  const notes = getNotes();
  const lowerQuery = query.toLowerCase();

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      (note.specificData?.tags || []).some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      )
  );
}

/**
 * Get default color for note type
 */
export function getDefaultColor(type) {
  const colors = {
    standard: "#fef3c7",
    checklist: "#d1fae5",
    idea: "#fce7f3",
    meeting: "#dbeafe",
    sticky: "#fef3c7",
  };
  return colors[type] || "#ffffff";
}

/**
 * Get content size for note card layout
 */
export function getContentSize(type, content, specificData) {
  if (type === NOTE_TYPES.STICKY) {
    const length = content?.length || 0;
    return length > 100 ? "medium" : "small";
  }

  if (type === NOTE_TYPES.STANDARD) {
    const contentLength = content?.length || 0;
    const tagsCount = specificData?.tags?.length || 0;
    if (contentLength > 150 || tagsCount > 3) return "medium";
    if (contentLength > 80) return "small";
    return "small";
  }

  if (type === NOTE_TYPES.IDEA) {
    const contentLength = content?.length || 0;
    const keyPointsCount = specificData?.keyPoints?.length || 0;
    if (keyPointsCount > 4 || contentLength > 220) return "large";
    if (keyPointsCount > 0 || contentLength > 120) return "medium";
    return "small";
  }

  if (type === NOTE_TYPES.CHECKLIST) {
    return "medium";
  }

  if (type === NOTE_TYPES.MEETING) {
    return "medium";
  }

  return "small";
}

/**
 * Toggle checklist item
 */
export function toggleChecklistItem(noteId, itemIndex) {
  const note = getNoteById(noteId);
  if (!note || note.type !== NOTE_TYPES.CHECKLIST) return null;

  const items = cloneObject(note.specificData?.items || []);
  if (items[itemIndex]) {
    items[itemIndex].checked = !items[itemIndex].checked;
  }

  return updateNote(noteId, {
    specificData: {
      ...note.specificData,
      items,
    },
  });
}

/**
 * Add checklist item
 */
export function addChecklistItem(noteId, itemText) {
  const note = getNoteById(noteId);
  if (!note || note.type !== NOTE_TYPES.CHECKLIST) return null;

  const items = cloneObject(note.specificData?.items || []);
  items.push({
    text: itemText,
    checked: false,
  });

  return updateNote(noteId, {
    specificData: {
      ...note.specificData,
      items,
    },
  });
}

/**
 * Remove checklist item
 */
export function removeChecklistItem(noteId, itemIndex) {
  const note = getNoteById(noteId);
  if (!note || note.type !== NOTE_TYPES.CHECKLIST) return null;

  const items = cloneObject(note.specificData?.items || []);
  items.splice(itemIndex, 1);

  return updateNote(noteId, {
    specificData: {
      ...note.specificData,
      items,
    },
  });
}

/**
 * Get checklist progress
 */
export function getChecklistProgress(noteId) {
  const note = getNoteById(noteId);
  if (!note || note.type !== NOTE_TYPES.CHECKLIST) return null;

  const items = note.specificData?.items || [];
  const completed = items.filter((item) => item.checked).length;

  return {
    completed,
    total: items.length,
    percentage: items.length > 0 ? Math.round((completed / items.length) * 100) : 0,
  };
}

/**
 * Add tag to note
 */
export function addTagToNote(noteId, tag) {
  const note = getNoteById(noteId);
  if (!note) return null;

  const tags = cloneObject(note.specificData?.tags || []);
  if (!tags.includes(tag)) {
    tags.push(tag);
  }

  return updateNote(noteId, {
    specificData: {
      ...note.specificData,
      tags,
    },
  });
}

/**
 * Remove tag from note
 */
export function removeTagFromNote(noteId, tag) {
  const note = getNoteById(noteId);
  if (!note) return null;

  const tags = cloneObject(note.specificData?.tags || []);
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
  }

  return updateNote(noteId, {
    specificData: {
      ...note.specificData,
      tags,
    },
  });
}

/**
 * Sort notes
 */
export function sortNotes(notes, sortBy = "created") {
  const sorted = cloneObject(notes);

  switch (sortBy) {
    case "created":
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "updated":
      return sorted.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "type":
      return sorted.sort((a, b) => a.type.localeCompare(b.type));
    default:
      return sorted;
  }
}

/**
 * Clear all notes
 */
export function clearAllNotes() {
  saveNotes([]);
}

/**
 * Export notes data
 */
export function exportNotes() {
  return JSON.stringify(getNotes(), null, 2);
}

/**
 * Import notes data
 */
export function importNotes(jsonData) {
  try {
    const notes = JSON.parse(jsonData);
    if (Array.isArray(notes)) {
      saveNotes(notes);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error importing notes:", error);
    return false;
  }
}
