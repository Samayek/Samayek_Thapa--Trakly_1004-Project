import { calculateSummary } from "./finance.js";
import { storage } from "./storage.js"; // Import storage for data access

let dashboardMonthDate = new Date();

export function renderDashboard() {
    const items = storage.getTaskEvents(); // Get all task/event items from storage
    const transactions = storage.getTransactions(); // Get all transactions for financial summary
    const monthlyBudget = storage.getMonthlyBudget(); // Get monthly budget for financial overview  

    const today = getTodayDateString();
    const dashboardMonthKey = getMonthKey(dashboardMonthDate);

    // Filtering tasks/events 
    const tasks = items.filter(item => item.type === "task");
    const events = items.filter(item => item.type === "event");

    // Dashboard Headline Values
    const todayTasks = tasks
        .filter(task => task.date === today)
        .sort((a, b) => `${a.time || "23:59"}`.localeCompare(`${b.time || "23:59"}`));
    const upcomingEvents = getUpcomingEvents(events, today, 7);

    // Monthly Summary Values
    const monthTasks = tasks.filter(item => (item.date || "" ).startsWith(dashboardMonthKey));
    const monthEvents = events.filter(item => (item.date || "" ).startsWith(dashboardMonthKey));
    const monthTransactions = transactions.filter(t => (t.date || "" ).startsWith(dashboardMonthKey));
    const monthItems = [...monthTasks, ...monthEvents];

    const { income, expense, netBalance } = calculateSummary(transactions);
    // Monthly Budget overview Values
    const monthExpense = calculateSummary(monthTransactions).expense;
    const budgetPercent = monthlyBudget > 0 ? Math.min((monthExpense / monthlyBudget) * 100, 100) : 0;

    return `
     <div class="container dashboard-shell">
            <div class="dashboard-header mb-4">
                <div>
                    <h2 class="mb-1">Dashboard</h2>
                    <p class="text-muted mb-0">
                        Monthly overview of tasks, events, finances, and productivity
                    </p>
                </div>
            </div>

            <!-- Top Summary Cards -->
            <!-- We no longer use generic "Activities". -->
            <!-- We explicitly separate task and event counts. -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card dashboard-stat-card p-3">
                        <h6 class="text-muted"><i class="bi bi-check2-square me-1"></i>Tasks This Month</h6>
                        <h3>${monthTasks.length}</h3>
                        <small class="text-muted">Daily to-do workload</small>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card dashboard-stat-card p-3">
                        <h6 class="text-muted"><i class="bi bi-calendar-event me-1"></i>Events This Month</h6>
                        <h3>${monthEvents.length}</h3>
                        <small class="text-muted">Major scheduled items</small>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card dashboard-stat-card p-3">
                        <h6 class="text-muted"><i class="bi bi-cash-stack me-1"></i>Budget Used</h6>
                        <h3>${formatCurrency(monthExpense)}</h3>
                        <small class="text-muted">Total recorded expenses</small>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card dashboard-stat-card p-3">
                        <h6 class="text-muted"><i class="bi bi-wallet2 me-1"></i>Current Balance</h6>
                        <h3>${formatCurrency(netBalance)}</h3>
                        <small class="text-muted">Income minus expenses</small>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <!-- Left: Today task list -->
                <div class="col-lg-7">
                    <div class="card dashboard-panel h-100">
                        <div class="dashboard-panel-header">
                            <h5 class="mb-0"><i class="bi bi-list-check me-2"></i>Today's Tasks</h5>
                        </div>

                        <div class="dashboard-panel-body">
                            ${renderTodayTaskList(todayTasks)}
                        </div>
                    </div>
                </div>

                <!-- Right: Donut budget overview -->
                <div class="col-lg-5">
                    <div class="card dashboard-panel h-100">
                        <div class="dashboard-panel-header">
                            <h5 class="mb-0"><i class="bi bi-pie-chart me-2"></i>Monthly Budget Overview</h5>
                        </div>

                        <div class="dashboard-panel-body">
                            ${renderBudgetDonut(monthlyBudget, monthExpense, budgetPercent)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <!-- Left: Upcoming events -->
                <div class="col-lg-6">
                    <div class="card dashboard-panel h-100">
                        <div class="dashboard-panel-header">
                            <h5 class="mb-0"><i class="bi bi-calendar-week me-2"></i>Upcoming Events (Next 7 Days)</h5>
                        </div>

                        <div class="dashboard-panel-body">
                            ${renderUpcomingEventList(upcomingEvents)}
                        </div>
                    </div>
                </div>

                <!-- Right: Monthly productivity summary -->
                <div class="col-lg-6">
                    <div class="card dashboard-panel h-100">
                        <div class="dashboard-panel-header">
                            <h5 class="mb-0"><i class="bi bi-graph-up-arrow me-2"></i>Monthly Productivity Summary</h5>
                            <input
                                type="month"
                                id="dashProductivityMonthFilter"
                                class="form-control form-control-sm"
                                value="${getMonthKey(dashboardMonthDate)}"
                                aria-label="Filter monthly productivity summary"
                                style="max-width: 180px;"
                            >
                        </div>

                        <div class="dashboard-panel-body">
                            ${renderMonthlyProductivitySummary(monthItems, monthTasks, monthEvents)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Monthly Heatmap -->
            <div class="card dashboard-panel">
                <div class="dashboard-panel-header dashboard-heatmap-header">
                    <div>
                        <h5 class="mb-0"><i class="bi bi-grid-3x3-gap me-2"></i>Task Contribution Heatmap</h5>
                        <small class="text-muted">
                            Daily task density for ${formatMonthLabel(dashboardMonthDate)}
                        </small>
                    </div>

                    <div class="dashboard-month-nav">
                        <!-- Same interaction idea as calendar prev/next -->
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="dashPrevMonth">
                            Prev
                        </button>
                        <span id="dashboardMonthLabel">${formatMonthLabel(dashboardMonthDate)}</span>
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="dashNextMonth">
                            Next
                        </button>
                    </div>
                </div>

                <div class="dashboard-panel-body">
                    ${renderMonthlyHeatmap(monthTasks, dashboardMonthDate)}
                </div>
            </div>
        </div>
    `;
}

export function setupDashboard() {
    const prevMonthBtn = document.getElementById("dashPrevMonth");
    const nextMonthBtn = document.getElementById("dashNextMonth");
    const productivityMonthFilter = document.getElementById("dashProductivityMonthFilter");

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            dashboardMonthDate.setMonth(dashboardMonthDate.getMonth() - 1);
            reRenderDashboard();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            dashboardMonthDate.setMonth(dashboardMonthDate.getMonth() + 1);
            reRenderDashboard();
        });
    }

    if (productivityMonthFilter) {
        productivityMonthFilter.addEventListener("change", (event) => {
            const value = event.target?.value;
            if (!value) return;

            const [year, month] = value.split("-").map(Number);
            if (!year || !month) return;

            dashboardMonthDate = new Date(year, month - 1, 1);
            reRenderDashboard();
        });
    }
}

// Helper function to re-render the dashboard when navigating months
function reRenderDashboard() {
    const container = document.getElementById("view-container");

    if (!container) {
        console.error("View container not found for re-rendering!"); // Error handling
        return;
    }

    container.innerHTML = renderDashboard(); // Re-render the dashboard HTML
    setupDashboard(); // Re-setup event listeners after re-rendering
}

function getTodayDateString() { // This is manual date formatting to ensure consistent YYYY-MM-DD format.
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`; // Format: YYYY-MM-DD 
}

function getMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}
function formatMonthLabel(date) {
    return date.toLocaleString("en-GB", {
        month: "long",
        year: "numeric"
    });
}

//
function getUpcomingEvents(events, todayString, daysRange) {
    const todayDate = new Date(todayString);   
    const endDate = new Date(todayString);
    endDate.setDate(endDate.getDate() + daysRange); // Calculate the end date based on the range

    return events
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= todayDate && eventDate <= endDate; // Include events within the date range
        })
        .sort((a, b) => {
            const first = `${a.date}T${a.time || "23:59"}`; // Treat events without time as end of day
            const second = `${b.date}T${b.time || "23:59"}`;
            return new Date(first) - new Date(second);
        });
}

//Rendering functions for different dashboard sections (today's tasks, upcoming events, budget donut, productivity summary, heatmap) would be defined below this point.

function renderTodayTaskList(tasks) {
    if (tasks.length === 0) {
        return `<p class="text-muted mb-0"><i class="bi bi-check2-circle me-2"></i>No tasks scheduled for today. Enjoy your day!</p>`;
    }
    return `
        <ul class="list-group list-group-flush dashboard-list dashboard-scroll-list">
        ${tasks.map(task => `
            <li class="list-group-item px-0">
                <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                        <strong><i class="bi bi-check2-square me-1"></i>${task.title}</strong>
                        <div class="small text-muted">
                            ${task.time ? `<i class="bi bi-clock me-1"></i>${task.time} | ` : ""}<i class="bi bi-flag me-1"></i>${task.priority || "No"} priority
                        </div>
                        ${task.desc ? `<div class="small">${task.desc}</div>` : ""}
                    </div>
                    <span class="badge ${statusBadgeClass(task.status)}">${task.status || "To Do"}</span>
                </div>
            </li>
        `).join("")}
        </ul>
    `;
}

function renderUpcomingEventList(events) {
    if (events.length === 0) {
        return `<p class="text-muted mb-0"><i class="bi bi-calendar2-check me-2"></i>No upcoming events in the next 7 days.</p>`;
    }
    return `
        <ul class="list-group list-group-flush dashboard-list dashboard-scroll-list">
        ${events.map(eventItem => `
            <li class="list-group-item px-0">
                <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                        <strong><i class="bi bi-calendar-event me-1"></i>${eventItem.title}</strong>
                        <div class="small text-muted">
                            <i class="bi bi-calendar3 me-1"></i>${formatReadableDate(eventItem.date)}${eventItem.time ? ` | <i class="bi bi-clock me-1"></i>${eventItem.time}` : ""}
                        </div>
                        ${ eventItem.desc ? `<div class="small">${eventItem.desc}</div>` : "" }
                    </div>
                    <span class="badge ${statusBadgeClass(eventItem.status)}">${eventItem.status || "To Do"}</span>
                </div>
            </li>
            `).join("")}
        </ul>
    `;
} 

function renderMonthlyProductivitySummary(monthItems, monthTasks, monthEvents) {
    const completedItems = monthItems.filter(item => item.status === "Done").length;
    const pendingItems = monthItems.filter(item => item.status !== "Done").length;

    return `
    <div class="row text-center g-3">
        <div class="col-4">
                <div class="dashboard-mini-stat">
                    <h6 class="text-muted">Tasks</h6>
                    <h4>${monthTasks.length}</h4>
                </div>
            </div>
            <div class="col-4">
                <div class="dashboard-mini-stat">
                    <h6 class="text-muted">Completed</h6>
                    <h4>${completedItems}</h4>
                </div>
            </div>
            <div class="col-4">
                <div class="dashboard-mini-stat">
                    <h6 class="text-muted">Events</h6>
                    <h4>${monthEvents.length}</h4>
                </div>
            </div>
        </div>

        <hr>

        <p class="mb-2"><strong>Pending / In Progress Items:</strong> ${pendingItems}</p>
        <p class="mb-0 text-muted">
            Completed updates automatically when a task or event status is set to Done.
        </p>
    `;
}

function renderBudgetDonut(monthlyBudget, monthExpense, budgetPercent) {
    if (monthlyBudget <= 0) {
        return `
        <p class="text-muted mb-0">
        No Monthly Budget has been set yet. Please set a budget in the Finance Tracker to activate this overview.
        </p>
        `;
    }

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (budgetPercent / 100) * circumference;
    const remaining = Math.max(monthlyBudget - monthExpense, 0);

    return `
    <div class="budget-donut-layout">
        <div class="budget-donut-wrap">
            <svg class="budget-donut" width="160" height="160" viewBox="0 0 160 160">
                <circle class="budget-donut-track" cx="80" cy="80" r="${radius}">
                </circle>
                <circle class = "budget-donut-progress" cx="80" cy="80" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${progress}">
                </circle>
            </svg>

            <div class="budget-donut-center">
                <strong>${budgetPercent.toFixed(1)}%</strong>
                <span>used</span>
            </div>
        </div>

            <div class="budget-donut-details">
                <p><strong>Budget: </strong> ${formatCurrency(monthlyBudget)}</p>
                <p><strong>Expense: </strong> ${formatCurrency(monthExpense)}</p>
                <p><strong>Remaining: </strong> ${formatCurrency(remaining)}</p>
            </div>
        </div>
        `;
}

function renderMonthlyHeatmap(monthTasks, targetMonthDate) {
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const taskCountByDate = {};

    monthTasks.forEach(task => {
        taskCountByDate[task.date] = (taskCountByDate[task.date] || 0) + 1;
    });

    const heatmapCells = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const count = taskCountByDate[fullDate] || 0;

        heatmapCells.push(`
           <div class="heatmap-day-wrap">
                <div
                    class="heatmap-cell level-${getHeatLevel(count)}"
                    title="${fullDate}: ${count} task(s)"
                ></div>
                <small>${day}</small>
            </div>
        `);
    }

    return `
        <div class="heatmap-legend mb-3">
            <span class="text-muted small">Less</span>
            <span class="heatmap-cell level-0"></span>
            <span class="heatmap-cell level-1"></span>
            <span class="heatmap-cell level-2"></span>
            <span class="heatmap-cell level-3"></span>
            <span class="heatmap-cell level-4"></span>
            <span class="text-muted small">More</span>
        </div>

        <div class="monthly-heatmap-grid">
            ${heatmapCells.join("")}
        </div>

        <p class="text-muted mt-3 mb-0">
            Darker cells mean more daily task activity in the selected month.
        </p>
    `;
}

// Helper function for heatmap, currency formatting, and event list rendering

function getHeatLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
} // might need to see what happens if there are more than 4 tasks in a day, but for now this is a simple 5-level scale (0-4)

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
    }).format(Number(amount).toFixed(2));
}

function formatReadableDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function statusBadgeClass(status) {
    const key = String(status || "").toLowerCase();
    if (key === "done") return "bg-success-subtle text-success-emphasis";
    if (key === "in progress") return "bg-warning-subtle text-warning-emphasis";
    return "bg-secondary-subtle text-secondary-emphasis";
}
