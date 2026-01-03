/**
 * Sistema de Modal de Confirmación Genérico
 * Permite reutilizar un modal para múltiples acciones
 */

const confirmationModal = document.getElementById("confirmationModal");
const confirmationTitle = document.getElementById("confirmationTitle");
const confirmationMessage = document.getElementById("confirmationMessage");
const confirmationIcon = document.getElementById("confirmationIcon");
const confirmationConfirm = document.getElementById("confirmationConfirm");
const confirmationCancel = document.getElementById("confirmationCancel");

let confirmCallback = null;
let cancelCallback = null;

/**
 * Iconos SVG para diferentes tipos de confirmación
 */
const icons = {
  delete: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>`,
  edit: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>`,
  logout: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>`,
  clear: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>`,
  warning: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
  success: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
};

/**
 * Abre el modal de confirmación con configuración personalizada
 * @param {Object} options - Configuración del modal
 * @param {string} options.title - Título del modal
 * @param {string} options.message - Mensaje de confirmación
 * @param {string} options.type - Tipo de acción (delete, edit, logout, clear, warning, success)
 * @param {string} options.confirmText - Texto del botón confirmar (default: "Confirmar")
 * @param {string} options.cancelText - Texto del botón cancelar (default: "Cancelar")
 * @param {Function} options.onConfirm - Callback cuando se confirma
 * @param {Function} options.onCancel - Callback cuando se cancela (opcional)
 */
export function showConfirmation(options) {
  const {
    title = "¿Confirmar acción?",
    message = "¿Estás seguro de que deseas continuar?",
    type = "warning",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm = null,
    onCancel = null,
  } = options;

  // Actualizar contenido del modal
  confirmationTitle.textContent = title;
  confirmationMessage.textContent = message;
  confirmationConfirm.textContent = confirmText;
  confirmationCancel.textContent = cancelText;

  // Actualizar icono según el tipo
  confirmationIcon.innerHTML = icons[type] || icons.warning;
  confirmationIcon.className = `confirmation-icon icon-${type}`;

  // Actualizar botón según el tipo
  confirmationConfirm.className = `btn-confirm btn-${type}`;

  // Guardar callbacks
  confirmCallback = onConfirm;
  cancelCallback = onCancel;

  // Mostrar modal
  confirmationModal.style.display = "flex";

  // Enfocar en el botón cancelar por defecto
  confirmationCancel.focus();
}

/**
 * Cierra el modal de confirmación
 */
export function closeConfirmation() {
  confirmationModal.style.display = "none";
  confirmCallback = null;
  cancelCallback = null;
}

// Event Listeners
confirmationConfirm.addEventListener("click", () => {
  if (confirmCallback) {
    confirmCallback();
  }
  closeConfirmation();
});

confirmationCancel.addEventListener("click", () => {
  if (cancelCallback) {
    cancelCallback();
  }
  closeConfirmation();
});

// Cerrar modal al hacer clic fuera
confirmationModal.addEventListener("click", (e) => {
  if (e.target === confirmationModal) {
    closeConfirmation();
  }
});

// Cerrar con tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && confirmationModal.style.display === "flex") {
    closeConfirmation();
  }
});
