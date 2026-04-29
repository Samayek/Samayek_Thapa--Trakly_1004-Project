import { storage } from "./storage.js";

let currentDate = new Date();  // Current month shown in the calendar
let selectedDate = null;       // Selected date used for filtering and prefilling the form
let editingItemId = null;      // Stores the item id when editing an existing task/event

/* Render the calendar view UI */
export function renderCalendar() {
    return `
        <div class="container calendar-shell">
            <div class="calendar-header">
                <div>
                    <h2 class="mb-1">Calendar</h2>
                    <p class="text-muted mb-0">Task and event planning by day and month</p>
                </div>
                <div class="calendar-quick-actions">
                    <button type="button" id="addTaskEventBtn" class="btn btn-primary">
                        <i class="bi bi-plus-circle me-1"></i>Add Task/Event
                    </button>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                <button type="button" id="prevMonth" class="btn btn-outline-secondary">Prev</button>
                <h5 id="currentMonth" class="mb-0">Month Year</h5>
                <div class="d-flex gap-2">
                    <button type="button" id="clearDateFilterBtn" class="btn btn-outline-secondary">Clear Date</button>
                    <button type="button" id="nextMonth" class="btn btn-outline-secondary">Next</button>
                </div>
            </div>

            <div id="calendarGrid" class="calendar-grid"></div>

            <div class="d-flex gap-2 mt-3">
                <span class="text-muted small align-self-center" id="selectedDateLabel"></span>
            </div>

            <dialog id="taskeventModal" class="task-eventModal custom-modal">
                <div class="modal-header">
                    <h2 id="taskeventModalTitle">Add New</h2>
                    <button type="button" id="closeCrossModal">&times;</button>
                </div>

                <form id="taskeventForm">
                    <input type="hidden" id="taskeventItemId" />

                    <div class="input-group">
                        <label class="form-label">TYPE</label>
                        <div class="type-toggle">
                            <br>
                            <input type="radio" id="task" name="type" value="task" checked>
                            <label for="task">Task</label>

                            <input type="radio" id="event" name="type" value="event">
                            <label for="event">Event</label>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="taskeventTitle" class="form-label">TITLE</label>
                        <input type="text" id="taskeventTitle" name="title" placeholder="Enter title..." required>
                    </div>

                    <div class="input-group">
                        <label for="taskeventDesc" class="form-label">DESCRIPTION</label>
                        <textarea id="taskeventDesc" name="desc" placeholder="Optional description..."></textarea>
                    </div>

                    <div class="row-flex">
                        <div class="input-group">
                            <label for="taskeventDate" class="form-label">DATE</label>
                            <input type="date" id="taskeventDate" name="date" required>
                        </div>
                        <div class="input-group">
                            <label for="taskeventStartTime" class="form-label">START TIME</label>
                            <input type="time" id="taskeventStartTime" name="startTime">
                        </div>
                    </div>

                    <div class="row-flex">
                        <div class="input-group">
                            <label for="taskeventEndTime" class="form-label">END TIME</label>
                            <input type="time" id="taskeventEndTime" name="endTime">
                        </div>
                        <div class="input-group">
                            <label for="taskeventReminder" class="form-label">REMINDER</label>
                            <select id="taskeventReminder" class="form-control">
                                <option value="none">None</option>
                                <option value="5m">5 minutes before</option>
                                <option value="10m">10 minutes before</option>
                                <option value="30m">30 minutes before</option>
                                <option value="1h">1 hour before</option>
                                <option value="1d">1 day before</option>
                            </select>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="taskeventRepeatType" class="form-label">REPEAT</label>
                        <select id="taskeventRepeatType" class="form-control">
                            <option value="none">None</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div class="row-flex d-none" id="repeatCustomRow">
                        <div class="input-group">
                            <label for="taskeventRepeatEvery" class="form-label">EVERY</label>
                            <input type="number" min="1" id="taskeventRepeatEvery" class="form-control" value="1">
                        </div>
                        <div class="input-group">
                            <label for="taskeventRepeatUnit" class="form-label">UNIT</label>
                            <select id="taskeventRepeatUnit" class="form-control">
                                <option value="day">Day(s)</option>
                                <option value="week">Week(s)</option>
                                <option value="month">Month(s)</option>
                            </select>
                        </div>
                    </div>

                    <div class="row" id="taskFieldsRow">
                        <div class="input-group">
                            <label for="taskeventPriority" class="form-label">PRIORITY</label>
                            <select name="priority" class="form-control" id="taskeventPriority">
                                <option>Low</option>
                                <option selected>Medium</option>
                                <option>High</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label for="taskeventStatus" class="form-label">STATUS</label>
                            <select name="status" class="form-control" id="taskeventStatus">
                                <option>To Do</option>
                                <option>In Progress</option>
                                <option>Done</option>
                            </select>
                        </div>
                    </div>

                    <div class="input-group">
                        <label class="form-label">COLOR LABEL</label>
                        <div class="color-picker" id="taskeventColor">
                            <input type="radio" name="color" value="purple" id="c1" checked>
                            <label for="c1" style="background: #5a57d6;"></label>

                            <input type="radio" name="color" value="blue" id="c2">
                            <label for="c2" style="background: #3498db;"></label>

                            <input type="radio" name="color" value="orange" id="c3">
                            <label for="c3" style="background: #e67e22;"></label>

                            <input type="radio" name="color" value="red" id="c4">
                            <label for="c4" style="background: #e74c3c;"></label>

                            <input type="radio" name="color" value="green" id="c5">
                            <label for="c5" style="background: #2ecc71;"></label>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="cancelTaskEventBtn" class="btn-cancel">Cancel</button>
                        <button type="submit" class="saveTaskEventBtn" id="saveTaskEventBtnLabel">Save</button>
                    </div>
                </form>
            </dialog>

            <div class="card p-3 mt-4 calendar-planner-card">
                <div class="calendar-planner-head">
                    <h6 class="mb-0"><i class="bi bi-list-check me-2"></i>Task and Event Planner</h6>
                    <button type="button" id="addTaskEventInlineBtn" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-plus-circle me-1"></i>Add
                    </button>
                </div>
                <ul class="list-group calendar-planner-scroll" id="taskeventList"></ul>
            </div>
        </div>
    `;
}

/* Attach calendar event listeners and UI behaviour */
export function setupCalendar() {

    // Calendar controls and form handling
    const addTaskEventBtn = document.getElementById("addTaskEventBtn");
    const taskeventModal = document.getElementById("taskeventModal");
    const closeCrossModal = document.getElementById("closeCrossModal");
    const cancelTaskEventBtn = document.getElementById("cancelTaskEventBtn");
    const taskeventForm = document.getElementById("taskeventForm");
    const taskeventList = document.getElementById("taskeventList");
    const addTaskEventInlineBtn = document.getElementById("addTaskEventInlineBtn");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const clearDateFilterBtn = document.getElementById("clearDateFilterBtn");

    const repeatTypeSelect = document.getElementById("taskeventRepeatType");
    const repeatCustomRow = document.getElementById("repeatCustomRow");

    if (!addTaskEventBtn || !taskeventModal || !closeCrossModal || !cancelTaskEventBtn || !taskeventForm || !prevMonthBtn || !nextMonthBtn || !taskeventList) {
        console.error("Calendar setup error: required elements not found.");
        return;
    }

    // Modal open/close actions
    addTaskEventBtn.addEventListener("click", () => openCreateModal());
    addTaskEventInlineBtn?.addEventListener("click", () => openCreateModal());
    closeCrossModal.addEventListener("click", closeAndResetModal);
    cancelTaskEventBtn.addEventListener("click", closeAndResetModal);

    // Month navigation
    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        selectedDate = null;
        renderCalendarGrid();
        renderTaskEventList();
    });

    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        selectedDate = null;
        renderCalendarGrid();
        renderTaskEventList();
    });

    clearDateFilterBtn?.addEventListener("click", () => {
        selectedDate = null;
        renderCalendarGrid();
        renderTaskEventList();
        updateSelectedDateLabel();
    });

    // Form behaviour updates
    repeatTypeSelect?.addEventListener("change", () => {
        const isCustom = repeatTypeSelect.value === "custom";
        repeatCustomRow?.classList.toggle("d-none", !isCustom);
    });

    // Save new or edited item
    taskeventForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = collectFormData();
        const validationError = validateCalendarItem(formData);
        if (validationError) {
            alert(validationError);
            return;
        }

        const normalized = normalizeTaskEventItem(formData);

        storage.upsertTaskEvent(normalized);
        selectedDate = normalized.date;

        renderCalendarGrid();
        renderTaskEventList();
        updateSelectedDateLabel();
        closeAndResetModal();
    });

    // Status, edit, and delete actions from the planner list
    taskeventList.addEventListener("click", (e) => {
        const statusBtn = e.target.closest(".status-pill-btn");
        const editBtn = e.target.closest(".edit-task-btn");
        const deleteBtn = e.target.closest(".delete-task-btn");

        if (statusBtn) {
            const id = Number(statusBtn.dataset.id);
            const nextStatus = statusBtn.dataset.status;
            const item = getTaskEventItems().find((x) => Number(x.id) === id);
            if (!item || !STATUS_OPTIONS.includes(nextStatus)) return;

            const updated = normalizeTaskEventItem({
                ...item,
                status: nextStatus,
                progress: nextStatus === "Done" ? 100 : 0,
                updatedAt: new Date().toISOString()
            });

            storage.upsertTaskEvent(updated);
            renderCalendarGrid();
            renderTaskEventList();
            updateSelectedDateLabel();
            return;
        }

        if (editBtn) {
            const id = Number(editBtn.dataset.id);
            const item = getTaskEventItems().find((x) => Number(x.id) === id);
            if (!item) return;
            openEditModal(item);
            return;
        }

        if (deleteBtn) {
            const id = Number(deleteBtn.dataset.id);
            const confirmed = window.confirm("Delete this task/event?");
            if (!confirmed) return;

            storage.deleteTaskEventById(id);
            renderCalendarGrid();
            renderTaskEventList();
            updateSelectedDateLabel();
        }
    });

    renderCalendarGrid();
    renderTaskEventList();
    updateSelectedDateLabel();
    applyNavContextIfAny();
}

// Modal helpers  

function openCreateModal() {
    editingItemId = null;
    const title = document.getElementById("taskeventModalTitle");
    const saveLabel = document.getElementById("saveTaskEventBtnLabel");
    const dateInput = document.getElementById("taskeventDate");
    const modal = document.getElementById("taskeventModal");
    const form = document.getElementById("taskeventForm");
    const repeatCustomRow = document.getElementById("repeatCustomRow");

    form.reset();
    setDefaultColor("purple");
    if (selectedDate && dateInput) dateInput.value = selectedDate;
    if (title) title.textContent = "Add New";
    if (saveLabel) saveLabel.textContent = "Save";
    if (repeatCustomRow) repeatCustomRow.classList.add("d-none");

    document.getElementById("taskeventRepeatEvery").value = "1";
    document.getElementById("taskeventReminder").value = "none";
    document.getElementById("taskeventRepeatType").value = "none";

    modal.showModal();
}

function openEditModal(itemRaw) {
    const item = normalizeTaskEventItem(itemRaw);
    editingItemId = item.id;

    const title = document.getElementById("taskeventModalTitle");
    const saveLabel = document.getElementById("saveTaskEventBtnLabel");
    const modal = document.getElementById("taskeventModal");
    const repeatCustomRow = document.getElementById("repeatCustomRow");

    if (title) title.textContent = "Edit Item";
    if (saveLabel) saveLabel.textContent = "Update";

    const typeInput = document.querySelector(`input[name="type"][value="${item.type}"]`);
    if (typeInput) typeInput.checked = true;

    document.getElementById("taskeventItemId").value = String(item.id || "");
    document.getElementById("taskeventTitle").value = item.title || "";
    document.getElementById("taskeventDesc").value = item.desc || "";
    document.getElementById("taskeventDate").value = item.date || "";
    document.getElementById("taskeventStartTime").value = item.startTime || "";
    document.getElementById("taskeventEndTime").value = item.endTime || "";
    document.getElementById("taskeventReminder").value = item.reminder || "none";
    document.getElementById("taskeventRepeatType").value = item.repeatType || "none";
    document.getElementById("taskeventRepeatEvery").value = String(item.repeatEvery || 1);
    document.getElementById("taskeventRepeatUnit").value = item.repeatUnit || "day";
    document.getElementById("taskeventPriority").value = item.priority || "Medium";
    document.getElementById("taskeventStatus").value = item.status || "To Do";

    setDefaultColor(item.color || "purple");

    if (repeatCustomRow) repeatCustomRow.classList.toggle("d-none", item.repeatType !== "custom");
    modal.showModal();
}

function closeAndResetModal() {
    const modal = document.getElementById("taskeventModal");
    const form = document.getElementById("taskeventForm");
    editingItemId = null;
    form?.reset();
    modal?.close();
}

function setDefaultColor(color) {
    const colorInput = document.querySelector(`input[name="color"][value="${color}"]`);
    if (colorInput) colorInput.checked = true;
}

// Data helpers

function getTaskEventItems() {
    return storage.getTaskEvents().map(normalizeTaskEventItem);
}

function collectFormData() {
    const type = document.querySelector(`input[name="type"]:checked`)?.value || "task";
    const startTime = document.getElementById("taskeventStartTime").value;
    const endTime = document.getElementById("taskeventEndTime").value;
    const status = document.getElementById("taskeventStatus").value;
    const progress = status === "Done" ? 100 : 0;

    const idValue = document.getElementById("taskeventItemId").value;

    return {
        id: editingItemId ?? (idValue ? Number(idValue) : Date.now()),
        type,
        title: document.getElementById("taskeventTitle").value.trim(),
        desc: document.getElementById("taskeventDesc").value.trim(),
        date: document.getElementById("taskeventDate").value,
        startTime,
        endTime,
        time: startTime, // backward compatibility
        reminder: document.getElementById("taskeventReminder").value || "none",
        repeatType: document.getElementById("taskeventRepeatType").value || "none",
        repeatEvery: Number(document.getElementById("taskeventRepeatEvery").value) || 1,
        repeatUnit: document.getElementById("taskeventRepeatUnit").value || "day",
        priority: document.getElementById("taskeventPriority").value || "Medium",
        status,
        progress: type === "task" ? progress : 0,
        color: document.querySelector(`input[name="color"]:checked`)?.value || "purple",
        updatedAt: new Date().toISOString()
    };
}

function validateCalendarItem(item) {
    if (!item.title) return "Please enter a title.";
    if (!item.date) return "Please select a date.";

    if (item.startTime && item.endTime && item.endTime < item.startTime) {
        return "End time must be after start time.";
    }

    if (item.repeatType === "custom" && (!Number.isFinite(item.repeatEvery) || item.repeatEvery < 1)) {
        return "Custom repeat value must be at least 1.";
    }

    return null;
}

function normalizeTaskEventItem(raw) {
    const type = raw?.type === "event" ? "event" : "task";
    const status = STATUS_OPTIONS.includes(raw?.status) ? raw.status : "To Do";
    const startTime = raw?.startTime || raw?.time || "";
    let progress = Number(raw?.progress ?? (status === "Done" ? 100 : 0));
    if (Number.isNaN(progress)) progress = status === "Done" ? 100 : 0;
    progress = clamp(progress, 0, 100);

    return {
        id: raw?.id ?? Date.now(),
        type,
        title: String(raw?.title || "").trim(),
        desc: String(raw?.desc || "").trim(),
        date: raw?.date || "",
        startTime,
        endTime: raw?.endTime || "",
        time: startTime, // compatibility bridge
        reminder: raw?.reminder || "none",
        repeatType: raw?.repeatType || "none",
        repeatEvery: Number(raw?.repeatEvery) > 0 ? Number(raw.repeatEvery) : 1,
        repeatUnit: raw?.repeatUnit || "day",
        priority: raw?.priority || "Medium",
        status,
        progress: type === "task" ? progress : 0,
        color: raw?.color || "purple",
        updatedAt: raw?.updatedAt || null
    };
}

//Rendering

function renderTaskEventList() {
    const taskeventList = document.getElementById("taskeventList");
    if (!taskeventList) return;

    const items = getTaskEventItems();
    let displayItems = items;

    if (selectedDate) {
        displayItems = items.filter((item) => occursOnDate(item, selectedDate));
    }

    displayItems = sortItems(displayItems);

    if (displayItems.length === 0) {
        taskeventList.innerHTML = `
            <li class="list-group-item text-muted">
                ${selectedDate ? "No tasks or events for the selected date." : "No tasks or events added yet."}
            </li>
        `;
        return;
    }

    taskeventList.innerHTML = displayItems
        .map((item) => {
            const typeLabel = item.type === "task" ? "Task" : "Event";
            const typeBadgeClass = item.type === "task" ? "bg-primary" : "bg-warning text-dark";
            const repeatBadge = item.repeatType !== "none" ? `<span class="badge bg-light text-dark border"><i class="bi bi-arrow-repeat me-1"></i>${escapeHtml(repeatText(item))}</span>` : "";
            const reminderBadge = item.reminder !== "none" ? `<span class="badge bg-light text-dark border"><i class="bi bi-bell me-1"></i>${escapeHtml(reminderText(item.reminder))}</span>` : "";
            const statusControls = STATUS_OPTIONS.map((statusOption) => `
                <button type="button"
                    class="status-pill-btn ${item.status === statusOption ? "is-active" : ""}"
                    data-id="${item.id}"
                    data-status="${statusOption}">
                    ${escapeHtml(statusOption)}
                </button>
            `).join("");
            return `
                <li class="list-group-item d-flex justify-content-between align-items-start" data-item-id="${item.id}">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <strong>${escapeHtml(item.title || "(Untitled)")}</strong>
                            <span class="badge ${typeBadgeClass}">${typeLabel}</span>
                        </div>

                        <small class="text-muted d-block">
                            <i class="bi bi-calendar3 me-1"></i>${escapeHtml(item.date)}
                            ${(item.startTime || item.endTime) ? ` | <i class="bi bi-clock me-1"></i>${escapeHtml(item.startTime || "--:--")}${item.endTime ? ` - ${escapeHtml(item.endTime)}` : ""}` : ""}
                        </small>

                        <div class="d-flex flex-wrap gap-2 mt-1">
                            <span class="badge bg-light text-dark border">${escapeHtml(item.priority)}</span>
                            ${repeatBadge}
                            ${reminderBadge}
                        </div>

                        ${item.desc ? `<small class="d-block mt-2">${escapeHtml(item.desc)}</small>` : ""}
                    </div>

                    <div class="d-flex flex-column align-items-end gap-2">
                        <div class="calendar-status-group" role="group" aria-label="Item status">
                            ${statusControls}
                        </div>
                        <button class="btn btn-sm btn-outline-primary edit-task-btn" data-id="${item.id}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-task-btn" data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </li>
            `;
        })
        .join("");
}

function renderCalendarGrid() {
    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthLabel = document.getElementById("currentMonth");
    if (!calendarGrid || !currentMonthLabel) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const items = getTaskEventItems();

    currentMonthLabel.textContent = currentDate.toLocaleString("en-GB", {
        month: "long",
        year: "numeric"
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let daysHTML = `
        <div class="calendar-weekday">Sun</div>
        <div class="calendar-weekday">Mon</div>
        <div class="calendar-weekday">Tue</div>
        <div class="calendar-weekday">Wed</div>
        <div class="calendar-weekday">Thu</div>
        <div class="calendar-weekday">Fri</div>
        <div class="calendar-weekday">Sat</div>
    `;

    for (let i = 0; i < firstDayOfMonth; i++) {
        daysHTML += `<div class="calendar-cell empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayItemsCount = items.filter((item) => occursOnDate(item, fullDate)).length;

        daysHTML += `
            <div class="calendar-cell calendar-day ${selectedDate === fullDate ? "selected" : ""}" data-date="${fullDate}">
                <strong>${day}</strong>
                ${dayItemsCount > 0 ? `<small class="d-block text-primary mt-1">${dayItemsCount} item(s)</small>` : ""}
            </div>
        `;
    }

    calendarGrid.innerHTML = daysHTML;

    document.querySelectorAll(".calendar-day").forEach((dayCell) => {
        dayCell.addEventListener("click", () => {
            selectedDate = dayCell.dataset.date;
            const dateInput = document.getElementById("taskeventDate");
            if (dateInput) dateInput.value = selectedDate;

            renderCalendarGrid();
            renderTaskEventList();
            updateSelectedDateLabel();
        });
    });
}

function updateSelectedDateLabel() {
    const label = document.getElementById("selectedDateLabel");
    if (!label) return;

    if (!selectedDate) {
        label.textContent = "Showing all items";
        return;
    }

    label.textContent = `Filtered by ${selectedDate}`;
}

// Repeat + date logic

function occursOnDate(item, targetDateString) {
    if (!item?.date || !targetDateString) return false;

    const start = parseDate(item.date);
    const target = parseDate(targetDateString);
    if (!start || !target) return false;
    if (target < start) return false;

    const repeatType = item.repeatType || "none";

    if (repeatType === "none") return item.date === targetDateString;

    const diffDays = Math.floor((target - start) / 86400000);
    const monthDiff = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());

    if (repeatType === "daily") return diffDays >= 0;
    if (repeatType === "weekly") return diffDays % 7 === 0;
    if (repeatType === "monthly") return start.getDate() === target.getDate();

    if (repeatType === "custom") {
        const every = item.repeatEvery > 0 ? item.repeatEvery : 1;
        const unit = item.repeatUnit || "day";

        if (unit === "day") return diffDays % every === 0;
        if (unit === "week") return diffDays % (every * 7) === 0;
        if (unit === "month") return start.getDate() === target.getDate() && monthDiff % every === 0;
    }

    return false;
}

function repeatText(item) {
    if (item.repeatType === "none") return "None";
    if (item.repeatType === "daily") return "Daily";
    if (item.repeatType === "weekly") return "Weekly";
    if (item.repeatType === "monthly") return "Monthly";
    return `Every ${item.repeatEvery || 1} ${item.repeatUnit || "day"}(s)`;
}

function reminderText(reminder) {
    const map = {
        none: "No reminder",
        "5m": "5m before",
        "10m": "10m before",
        "30m": "30m before",
        "1h": "1h before",
        "1d": "1d before"
    };
    return map[reminder] || reminder;
}

// Navigation context from shell (search/notifications)

function applyNavContextIfAny() {
    const raw = sessionStorage.getItem("traklyNavContext");
    if (!raw) return;

    try {
        const ctx = JSON.parse(raw);
        if (ctx.view !== "calendar" || !ctx.date) return;

        currentDate = new Date(`${ctx.date}T00:00:00`);
        selectedDate = ctx.date;

        renderCalendarGrid();
        renderTaskEventList();
        updateSelectedDateLabel();

        if (ctx.itemId != null) {
            requestAnimationFrame(() => {
                const target = document.querySelector(`[data-item-id="${ctx.itemId}"]`);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                    target.classList.add("calendar-item-highlight");
                    setTimeout(() => target.classList.remove("calendar-item-highlight"), 1600);
                }
            });
        }
    } catch (error) {
        console.error("Invalid calendar navigation context:", error);
    } finally {
        sessionStorage.removeItem("traklyNavContext");
    }
}

// Utilities


function sortItems(items) {
    return [...items].sort((a, b) => {
        const aKey = `${a.date || ""}T${a.startTime || "23:59"}`;
        const bKey = `${b.date || ""}T${b.startTime || "23:59"}`;
        return new Date(aKey) - new Date(bKey);
    });
}

function parseDate(yyyyMmDd) {
    if (!yyyyMmDd) return null;
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];
