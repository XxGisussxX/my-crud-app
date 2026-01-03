/**
 * Search Module
 * Handles search functionality across different sections
 */

import { searchAndRenderNotes } from "../notes/ui.js";

/**
 * Initialize search functionality
 */
export function initSearch() {
  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) return;

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    // Add search indicator
    const searchBar = document.querySelector(".search-bar");
    searchBar.classList.add("searching");

    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();
      performSearch(query);
      searchBar.classList.remove("searching");
    }, 300);
  });
}

/**
 * Perform search based on active section
 */
export function performSearch(query) {
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
      searchAndRenderNotes(query);
      break;
    default:
      break;
  }
}

/**
 * Search tasks in card view
 */
export function searchTasks(query) {
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

/**
 * Search tasks in table view
 */
export function searchTasksTable(query) {
  const rows = document.querySelectorAll("#taskTable tbody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();

    if (query === "" || text.includes(query)) {
      row.style.display = "";
      highlightSearchTerm(row, query);
    } else {
      row.style.display = "none";
    }
  });
}

/**
 * Highlight search terms in elements
 */
export function highlightSearchTerm(element, query) {
  if (!query) {
    // Remove existing highlights
    element.querySelectorAll("mark").forEach((mark) => {
      mark.outerHTML = mark.innerHTML;
    });
    return;
  }

  const textNodes = getTextNodes(element);
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");

  textNodes.forEach((node) => {
    const text = node.textContent;
    if (regex.test(text)) {
      const span = document.createElement("span");
      span.innerHTML = text.replace(regex, "<mark>$1</mark>");
      node.parentNode.replaceChild(span, node);
    }
  });
}

/**
 * Clear all search highlights
 */
export function clearSearchHighlights() {
  document.querySelectorAll("mark").forEach((mark) => {
    const text = mark.textContent;
    const textNode = document.createTextNode(text);
    mark.parentNode.replaceChild(textNode, mark);
  });
}

/**
 * Get all text nodes from element
 */
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script, style, and already highlighted nodes
        if (
          node.parentNode.tagName === "SCRIPT" ||
          node.parentNode.tagName === "STYLE" ||
          node.parentNode.tagName === "MARK"
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.textContent.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  return textNodes;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
