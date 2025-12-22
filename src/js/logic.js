import { getTasks, saveTasks } from "./storage.js";

export function addTask(taskData) {
  const tasks = getTasks();
  const newTask = {
    id: crypto.randomUUID(),
    text: taskData.text,
    description: taskData.description || "",
    priority: taskData.priority || "medium",
    date: taskData.date || "",
    createdAt: new Date().toISOString().split("T")[0], // Fecha de creación
    completed: false,
    completedAt: null, // Fecha de completado
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function toggleTask(id) {
  const tasks = getTasks();
  const updated = tasks.map((t) => {
    if (t.id === id) {
      const isCompleted = !t.completed;
      return {
        ...t,
        completed: isCompleted,
        completedAt: isCompleted
          ? new Date().toISOString().split("T")[0]
          : null,
      };
    }
    return t;
  });
  saveTasks(updated);
}

export function deleteTask(id) {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  saveTasks(filtered);
}
