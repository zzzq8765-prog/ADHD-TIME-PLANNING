const planner = document.getElementById("planner");
const datePicker = document.getElementById("datePicker");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");
const progressFill = document.getElementById("progressFill");
const focusList = document.getElementById("focusList");
const addFocusBtn = document.getElementById("addFocusBtn");
const startTimeSelect = document.getElementById("startTime");
const endTimeSelect = document.getElementById("endTime");
const allHours = [];
for (let h = 0; h < 24; h++) {
  allHours.push(`${String(h).padStart(2, "0")}:00`);
}

function getSelectedHours(start, end) {
  const startIndex = allHours.indexOf(start);
  const endIndex = allHours.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  const selected = [];
  let index = startIndex;

  while (true) {
    selected.push(allHours[index]);
    if (index === endIndex) break;
    index = (index + 1) % 24;
  }

  return selected;
}

function getTodayString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getStorageKey(date) {
  return `focusgrid-${date}`;
}
function getTimeRangeStorageKey() {
  return "focusgrid-time-range";
}

function loadTimeRange() {
  const raw = localStorage.getItem(getTimeRangeStorageKey());
  return raw ? JSON.parse(raw) : { start: "08:00", end: "22:00" };
}

function saveTimeRange(range) {
  localStorage.setItem(getTimeRangeStorageKey(), JSON.stringify(range));
}

function populateTimeSelectors() {
  startTimeSelect.innerHTML = "";
  endTimeSelect.innerHTML = "";

  allHours.forEach(hour => {
    const startOption = document.createElement("option");
    startOption.value = hour;
    startOption.textContent = hour;
    startTimeSelect.appendChild(startOption);

    const endOption = document.createElement("option");
    endOption.value = hour;
    endOption.textContent = hour;
    endTimeSelect.appendChild(endOption);
  });

  const savedRange = loadTimeRange();
  startTimeSelect.value = savedRange.start;
  endTimeSelect.value = savedRange.end;
}
function getFocusStorageKey() {
  return "focusgrid-ongoing-focus";
}

function loadFocuses() {
  const raw = localStorage.getItem(getFocusStorageKey());
  return raw ? JSON.parse(raw) : ["", "", ""];
}

function saveFocuses(focuses) {
  localStorage.setItem(getFocusStorageKey(), JSON.stringify(focuses));
}

function renderFocuses() {
  const focuses = loadFocuses();
  focusList.innerHTML = "";

  focuses.forEach((focus, index) => {
    const item = document.createElement("div");
    item.className = "focus-item";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "focus-input";
    input.placeholder = "Add an ongoing focus...";
    input.value = focus;

    input.addEventListener("input", () => {
      const updatedFocuses = loadFocuses();
      updatedFocuses[index] = input.value;
      saveFocuses(updatedFocuses);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-focus-btn";
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
      const updatedFocuses = loadFocuses();
      updatedFocuses.splice(index, 1);

      if (updatedFocuses.length === 0) {
        updatedFocuses.push("");
      }

      saveFocuses(updatedFocuses);
      renderFocuses();
    });

    item.appendChild(input);
    item.appendChild(removeBtn);
    focusList.appendChild(item);
  });
}

function loadData(date) {
  const raw = localStorage.getItem(getStorageKey(date));
  return raw ? JSON.parse(raw) : {};
}

function saveData(date, data) {
  localStorage.setItem(getStorageKey(date), JSON.stringify(data));
}

function updateSummary(data, hours) {
  const total = hours.length;
  const completed = hours.filter(hour => data[hour]?.done).length;

  completedCount.textContent = completed;
  totalCount.textContent = total;

  const progress = total === 0 ? 0 : (completed / total) * 100;
  progressFill.style.width = `${progress}%`;
}

function renderPlanner(date) {
  planner.innerHTML = "";
  const data = loadData(date);

  const { start, end } = loadTimeRange();
  const hours = getSelectedHours(start, end);

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
  updateSummary(data, hours);
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

   updateSummary(data, hours);
}
datePicker.value = getTodayString();
populateTimeSelectors();
renderFocuses();
renderPlanner(datePicker.value);

addFocusBtn.addEventListener("click", () => {
  const focuses = loadFocuses();
  focuses.push("");
  saveFocuses(focuses);
  renderFocuses();
});

datePicker.addEventListener("change", () => {
  renderPlanner(datePicker.value);
});

startTimeSelect.addEventListener("change", () => {
  saveTimeRange({
    start: startTimeSelect.value,
    end: endTimeSelect.value
  });
  renderPlanner(datePicker.value);
});

endTimeSelect.addEventListener("change", () => {
  saveTimeRange({
    start: startTimeSelect.value,
    end: endTimeSelect.value
  });
  renderPlanner(datePicker.value);
});