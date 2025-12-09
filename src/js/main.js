import { addTask } from "./logic.js";
import { renderTasks, updateStats } from "./ui.js";

const btn = document.getElementById("addBtn");
const modal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const taskForm = document.getElementById("taskForm");

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
  renderTasks();
  updateStats();
});

renderTasks();
updateStats();
