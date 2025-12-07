import { addTask } from "./js/logic.js";
import { renderTasks } from "./js/ui.js";

const input = document.getElementById("taskInput");
const btn = document.getElementById("addBtn");

btn.addEventListener("click", () => {
  if (input.value.trim() === "") return;

  addTask(input.value);
  input.value = "";
  renderTasks();
});

renderTasks();
