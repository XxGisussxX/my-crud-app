/**
 * Utilities Module
 * Helper functions and common utilities
 */

/**
 * Generate a unique ID
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Debounce function to limit function calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format date to readable string
 */
export function formatDate(
  date,
  options = { year: "numeric", month: "short", day: "numeric" }
) {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("es-ES", options);
}

/**
 * Format date to ISO format (YYYY-MM-DD)
 */
export function formatDateISO(date) {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toISOString().split("T")[0];
}

/**
 * Parse date string
 */
export function parseDate(dateString) {
  if (!dateString) return new Date();
  return new Date(dateString);
}

/**
 * Check if element exists
 */
export function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

/**
 * Show element
 */
export function showElement(element) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.style.display = "flex";
  }
}

/**
 * Hide element
 */
export function hideElement(element) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.style.display = "none";
  }
}

/**
 * Toggle element visibility
 */
export function toggleElement(element) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.style.display = element.style.display === "none" ? "flex" : "none";
  }
}

/**
 * Add class to element
 */
export function addClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 */
export function removeClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Toggle class on element
 */
export function toggleClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Has class
 */
export function hasClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    return element.classList.contains(className);
  }
  return false;
}

/**
 * Get element(s)
 */
export function getElement(selector) {
  return document.querySelector(selector);
}

export function getElements(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Add event listener with cleanup
 */
export function onEvent(element, event, handler) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  if (element) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }
}

/**
 * Add event listener to multiple elements
 */
export function onEvents(selector, event, handler) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.addEventListener(event, handler));
  return () => {
    elements.forEach((el) => el.removeEventListener(event, handler));
  };
}

/**
 * Fire custom event
 */
export function fireEvent(eventName, detail = {}) {
  const event = new CustomEvent(eventName, { detail });
  document.dispatchEvent(event);
}

/**
 * Listen for custom event
 */
export function onCustomEvent(eventName, handler) {
  document.addEventListener(eventName, handler);
  return () => document.removeEventListener(eventName, handler);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Highlight text in string
 */
export function highlightText(text, search) {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * Sort array of objects
 */
export function sortBy(array, key, order = "asc") {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === "asc" ? -1 : 1;
    if (a[key] > b[key]) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by property
 */
export function filterBy(array, property, value) {
  return array.filter((item) => item[property] === value);
}

/**
 * Check if array is empty
 */
export function isEmpty(array) {
  return Array.isArray(array) && array.length === 0;
}

/**
 * Clone object
 */
export function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}
