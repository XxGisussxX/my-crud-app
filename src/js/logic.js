import { getTasks, saveTasks } from "./storage.js";

export function addTask(taskData) {
  const tasks = getTasks();
  const newTask = {
    id: crypto.randomUUID(),
    text: taskData.text,
    description: taskData.description || "",
    priority: taskData.priority || "medium",
    date: taskData.date || "",
    completed: false,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function toggleTask(id) {
  const tasks = getTasks();
  const updated = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks(updated);
}

export function deleteTask(id) {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  saveTasks(filtered);
}
