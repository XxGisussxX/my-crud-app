// Lee tareas desde LocalStorage
export function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// Guarda tareas en LocalStorage
export function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
