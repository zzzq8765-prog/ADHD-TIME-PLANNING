const planner = document.getElementById("planner");
const datePicker = document.getElementById("datePicker");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");

const hours = [];
for (let h = 8; h <= 22; h++) {
  hours.push(`${String(h).padStart(2, "0")}:00`);
}

function getTodayString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getStorageKey(date) {
  return `focusgrid-${date}`;
}

function loadData(date) {
  const raw = localStorage.getItem(getStorageKey(date));
  return raw ? JSON.parse(raw) : {};
}

function saveData(date, data) {
  localStorage.setItem(getStorageKey(date), JSON.stringify(data));
}

function updateSummary(data) {
  const total = hours.length;
  const completed = hours.filter(hour => data[hour]?.done).length;
  completedCount.textContent = completed;
  totalCount.textContent = total;
}

function renderPlanner(date) {
  planner.innerHTML = "";
  const data = loadData(date);

  hours.forEach(hour => {
    const block = document.createElement("div");
    block.className = "time-block";
    if (data[hour]?.done) {
      block.classList.add("completed");
    }

    const label = document.createElement("div");
    label.className = "time-label";
    label.textContent = hour;

    const input = document.createElement("input");
    input.className = "task-input";
    input.type = "text";
    input.placeholder = "What will you do?";
    input.value = data[hour]?.task || "";

    const checkboxWrap = document.createElement("label");
    checkboxWrap.className = "checkbox-wrap";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data[hour]?.done || false;

    const checkText = document.createElement("span");
    checkText.textContent = "Done";

    input.addEventListener("input", () => {
      data[hour] = {
        task: input.value,
        done: checkbox.checked
      };
      saveData(date, data);
      updateSummary(data);
    });

    checkbox.addEventListener("change", () => {
      data[hour] = {
        task: input.value,
        done: checkbox.checked
      };
      saveData(date, data);
      renderPlanner(date);
    });

    checkboxWrap.appendChild(checkbox);
    checkboxWrap.appendChild(checkText);

    block.appendChild(label);
    block.appendChild(input);
    block.appendChild(checkboxWrap);

    planner.appendChild(block);
  });

  updateSummary(data);
}

datePicker.value = getTodayString();
renderPlanner(datePicker.value);

datePicker.addEventListener("change", () => {
  renderPlanner(datePicker.value);
});