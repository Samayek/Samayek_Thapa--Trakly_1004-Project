// app.js - Main JavaScript entry point for Trakly SPA

import { loadView } from "./router.js"; // Import the router function to handle view loading
import { storage } from "./modules/storage.js"; // Import the storage module for data management}

//Getting element references for topbar title and mobile menu functionality
const topbarTitle = document.getElementById("topbarTitle");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

// Topbar shell widgets
const globalSearchWrap = document.getElementById("globalSearchWrap");
const globalSearchInput = document.getElementById("globalSearchInput");
const globalSearchResults = document.getElementById("globalSearchResults");

const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const notificationEmpty = document.getElementById("notificationEmpty");
const notificationDot = document.getElementById("notificationDot");
const markAllReadBtn = document.getElementById("markAllReadBtn");

// Update topbar title whenever a nav button is clicked
function updateTopbarTitle(button) {
    if (!topbarTitle || !button) {
        console.error("Topbar title element or button not found!"); // Safety check
        return;
    }               
    topbarTitle.textContent = button.textContent.trim();
}

// Function to set topbar date
function setTopbarDate() {
    const dateElement = document.getElementById("topbarDate");
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-GB", {
            weekday: "short", day: "numeric", month: "short", year: "numeric"
        });
    }
}

// Mobile sidebar open/close
if (mobileMenuBtn && sidebar && sidebarOverlay) {
    mobileMenuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
        sidebarOverlay.classList.toggle("active");
    });

    sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("mobile-open");
        sidebarOverlay.classList.remove("active");
    });
}

// Theme toggle functionality (this will be triggered by the settings module as well)
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Apply saved theme preference on Startup
function applySavedTheme() {
    document.documentElement.setAttribute("data-theme", storage.getTheme());
}

// Toggle theme between light and dark modes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    storage.setTheme(newTheme); // Save the user's theme preference
}

if (themeToggleBtn) { // Safety check to ensure the theme toggle button exists
    themeToggleBtn.addEventListener("click", toggleTheme);
}

// Selecting all NAV buttons
const navButtons = document.querySelectorAll(".nav-btn");

// Adding Event Listeners
navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const viewName = button.dataset.view; // Get the view name from the data attribute
        console.log(`Button clicked: ${button.textContent}, View: ${viewName}`); // Debug log

        if (!viewName) {
            console.error("View name not specified for the clicked button!"); // Safety check
            return;
        }

        loadView(viewName);  // Load the corresponding view using the router function

        setActiveButton(button); // Update the active state of the navigation buttons
        updateTopbarTitle(button); // Update the topbar title based on the clicked button
    });
});

// Active Button function to highlight the current view in the sidebar
function setActiveButton(activeBtn) {

    navButtons.forEach(btn => {
       btn.classList.toggle("active", btn === activeBtn); // Toggle 'active' class based on the clicked button
    });
}

// Functions to operate search bar, functionality
function buildSearchIndex() {
    const items = [];

    storage.getTaskEvents().forEach((item) => {
        items.push({
            id: `te:${item.id ?? `${item.type}-${item.date}-${item.title}`}`,
            itemId: item.id,
            date: item.date || "",
            module: "calendar",
            label: item.type === "event" ? "Event" : "Task",
            title: item.title || "(Untitled)",
            meta: [item.date, item.time, item.priority, item.status].filter(Boolean).join(" | "),
            text: [
                item.title, item.desc, item.type, item.priority, item.status, item.date, item.time
            ].filter(Boolean).join(" ").toLowerCase()
        });
    });

    storage.getTransactions().forEach((t) => {
        items.push({
            id: `tx:${t.id ?? `${t.date}-${t.amount}-${t.desc}`}`,
            module: "finance",
            label: "Transaction",
            title: t.desc || "(No description)",
            meta: [t.date, t.type, t.category, formatCurrency(t.amount)].filter(Boolean).join(" | "),
            text: [
                t.desc, t.type, t.category, t.method, t.date, String(t.amount)
            ].filter(Boolean).join(" ").toLowerCase()
        });
    });

    return items;
}

function renderSearchResults(results, query) {
    if (!globalSearchResults) return;

    if (!query) {
        globalSearchResults.classList.remove("is-open");
        globalSearchResults.innerHTML = "";
        return;
    }

    if (results.length === 0) {
        globalSearchResults.innerHTML = `
            <div class="search-result-item">
                <div class="search-result-title">No results found</div>
                <div class="search-result-meta">Try another keyword</div>
            </div>
        `;
        globalSearchResults.classList.add("is-open");
        return;
    }

    globalSearchResults.innerHTML = results.slice(0, 12).map((r) => `
        <button class="search-result-item w-100 text-start border-0 bg-transparent" data-result-id="${r.id}">
            <div class="search-result-title">${escapeHtml(r.title)}</div>
            <div class="search-result-meta">
                <span class="search-result-badge">${escapeHtml(r.label)}</span>
                <span>${escapeHtml(r.meta || "")}</span>
            </div>
        </button>
    `).join("");

    globalSearchResults.classList.add("is-open");
}

function initGlobalSearch() {
    if (!globalSearchInput || !globalSearchResults) return;

    globalSearchInput.addEventListener("input", () => {
        const query = globalSearchInput.value.trim().toLowerCase();
        const index = buildSearchIndex();
        const results = query ? index.filter((x) => x.text.includes(query)) : [];
        renderSearchResults(results, query);
    });

    globalSearchResults.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-result-id]");
        if (!btn) return;

        const resultId = btn.dataset.resultId;
        const result = buildSearchIndex().find((x) => x.id === resultId);
        if (!result) return;

        if (result.module === "calendar") {
            navigateToCalendarItem({ date: result.date, itemId: result.itemId });
        }
        else {
            loadView(result.module);
            const navBtn = document.querySelector(`.nav-btn[data-view="${result.module}"]`);
            if (navBtn) {
                setActiveButton(navBtn);
                updateTopbarTitle(navBtn);
            }
        }

        sessionStorage.setItem("traklyFocusItem", result.id);

        globalSearchInput.value = "";
        globalSearchResults.innerHTML = "";
        globalSearchResults.classList.remove("is-open");
    });
}

// Build and manage notification items from calendar data (due, overdue, upcoming, and reminder-triggered).
function buildNotifications() {
    const now = new Date();
    const today = getTodayKey();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const dismissed = new Set(storage.getDismissedNotifications?.() || []);
    const notices = [];

    storage.getTaskEvents().forEach((item) => {
        if (!item?.date) return;
        const isDone = String(item.status || "").toLowerCase() === "done";
        const baseTime = item.startTime || item.time || "23:59";
        const dateObj = new Date(`${item.date}T${baseTime}`);
        const reminderValue = item.reminder || "none";
        const reminderEvery = Number(item.reminderEvery) > 0 ? Number(item.reminderEvery) : 1;
        const reminderUnit = ["minute", "hour", "day", "week"].includes(item.reminderUnit) ? item.reminderUnit : "minute";
        const reminderBaseTime = baseTime;
        const reminderDateObj = new Date(`${item.date}T${reminderBaseTime}`);

        if (item.type === "task" && item.date === today && !isDone) {
            notices.push({
                id: `due:${item.id ?? `${item.date}-${item.title}`}`,
                view: "calendar",
                title: `Task due today: ${item.title || "(Untitled)"}`,
                meta: `${item.date}${baseTime ? ` | ${baseTime}` : ""}`,
                date: item.date,
                itemId: item.id ?? null
            });
        }

        if (item.type === "task" && dateObj < now && !isDone) {
            notices.push({
                id: `overdue:${item.id ?? `${item.date}-${item.title}`}`,
                view: "calendar",
                title: `Overdue task: ${item.title || "(Untitled)"}`,
                meta: `${item.date}${baseTime ? ` | ${baseTime}` : ""}`,
                date: item.date,
                itemId: item.id ?? null
            });
        }

        if (item.type === "event" && dateObj >= now && dateObj <= in7Days) {
            notices.push({
                id: `upcoming:${item.id ?? `${item.date}-${item.title}`}`,
                view: "calendar",
                title: `Upcoming event: ${item.title || "(Untitled)"}`,
                meta: `${item.date}${baseTime ? ` | ${baseTime}` : ""}`,
                date: item.date,
                itemId: item.id ?? null
            });
        }

        if (reminderValue !== "none" && !isDone && !Number.isNaN(reminderDateObj.getTime())) {
            const offset = reminderOffsetMs(reminderValue, reminderEvery, reminderUnit);
            if (offset > 0) {
                const triggerTime = new Date(reminderDateObj.getTime() - offset);
                if (now >= triggerTime && now <= reminderDateObj) {
                    const reminderToken = reminderValue === "custom" ? `${reminderEvery}${reminderUnit}` : reminderValue;
                    notices.push({
                        id: `reminder:${item.id ?? `${item.date}-${item.title}`}:${reminderToken}`,
                        view: "calendar",
                        title: `Reminder: ${item.title || "(Untitled)"}`,
                        meta: `${item.date} | ${reminderBaseTime}`,
                        date: item.date,
                        itemId: item.id ?? null
                    });
                }
            }
        }
    });

    const visible = notices.filter((n) => !dismissed.has(n.id));
    const unique = new Map();
    visible.forEach((item) => {
        if (!unique.has(item.id)) unique.set(item.id, item);
    });
    return Array.from(unique.values());
}

function markNotificationRead(id) {
    const read = storage.getReadNotifications?.() || [];
    if (!read.includes(id)) storage.setReadNotifications?.([...read, id]);
}

function dismissNotification(id) {
    const dismissed = storage.getDismissedNotifications?.() || [];
    if (!dismissed.includes(id)) storage.setDismissedNotifications?.([...dismissed, id]);
}

function renderNotifications() {
    if (!notificationList || !notificationEmpty || !notificationDot) return;

    const notifications = buildNotifications();
    const read = new Set(storage.getReadNotifications?.() || []);

    if (notifications.length === 0) {
        notificationList.innerHTML = "";
        notificationEmpty.classList.remove("d-none");
        notificationDot.classList.remove("is-visible");
        return;
    }

    notificationEmpty.classList.add("d-none");
    notificationList.innerHTML = notifications.map((n) => `
        <div class="notification-item ${read.has(n.id) ? "" : "unread"}" data-id="${n.id}" data-view="${n.view}" data-date="${n.date || ""}" data-item-id="${n.itemId ?? ""}">
            <div class="notification-item-title">${escapeHtml(n.title)}</div>
            <div class="notification-item-meta">${escapeHtml(n.meta)}</div>
            <div class="notification-item-actions">
                <button class="btn btn-sm btn-outline-primary" data-action="open">View</button>
                <button class="btn btn-sm btn-outline-secondary" data-action="read">Read</button>
                <button class="btn btn-sm btn-outline-danger" data-action="dismiss">Dismiss</button>
            </div>
        </div>
    `).join("");

    const unreadCount = notifications.filter((n) => !read.has(n.id)).length;
    notificationDot.classList.toggle("is-visible", unreadCount > 0);
}

function initNotifications() {
    if (!notificationBtn || !notificationPanel || !notificationList) return;

    notificationBtn.addEventListener("click", () => {
        notificationPanel.classList.toggle("is-open");
        notificationPanel.setAttribute("aria-hidden", notificationPanel.classList.contains("is-open") ? "false" : "true");
        if (notificationPanel.classList.contains("is-open")) renderNotifications();
    });

    markAllReadBtn?.addEventListener("click", () => {
        const allIds = buildNotifications().map((n) => n.id);
        const read = new Set(storage.getReadNotifications?.() || []);
        allIds.forEach((id) => read.add(id));
        storage.setReadNotifications?.(Array.from(read));
        renderNotifications();
    });

    // Handle notification item actions (view, mark as read, dismiss)
    notificationList.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-action]");
        const card = e.target.closest(".notification-item");
        if (!actionBtn || !card) return;

        const id = card.dataset.id;
        const view = card.dataset.view;
        const date = card.dataset.date;
        const itemIdRaw = card.dataset.itemId;
        const itemId = itemIdRaw === "" ? null : (Number.isNaN(Number(itemIdRaw)) ? itemIdRaw : Number(itemIdRaw));
        const action = actionBtn.dataset.action;

        if (action === "read") {
            markNotificationRead(id);
            renderNotifications();
            return;
        }

        if (action === "dismiss") {
            dismissNotification(id);
            renderNotifications();
            return;
        }

        // open should jump to exact item now, not just calendar home, "View" keeps context and jumps to exact calendar date/item
        if (action === "open") {
            markNotificationRead(id);
            if (view === "calendar" && date) {
                navigateToCalendarItem({ date, itemId });
            } else {
                loadView(view);
                const navBtn = document.querySelector(`.nav-btn[data-view="${view}"]`);
                if (navBtn) {
                    setActiveButton(navBtn);
                    updateTopbarTitle(navBtn);
                }
            }
            notificationPanel.classList.remove("is-open");
            notificationPanel.setAttribute("aria-hidden", "true");
            renderNotifications();
        }
    });

    // Allows Settings page controls to refresh bell/panel state immediately.
    window.addEventListener("trakly:notifications-updated", () => {
        renderNotifications();
    });

    // Keeps bell dot and list state dynamic as time passes.
    if (window.__traklyNotifRefreshIntervalId) {
        window.clearInterval(window.__traklyNotifRefreshIntervalId);
    }
    window.__traklyNotifRefreshIntervalId = window.setInterval(() => {
        renderNotifications();
    }, 30000);

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) renderNotifications();
    });
}

// Reminder engine to trigger notifications based on task/event reminders and update the notification panel accordingly
// This runs on an interval and also when the app gains focus to ensure timely reminders.
function runReminderTick({ pushBrowserNotification = true } = {}) {
    const now = new Date();
    const dueItems = [];
    const notified = new Set(JSON.parse(sessionStorage.getItem("traklyReminderNotified") || "[]"));

    storage.getTaskEvents().forEach((item) => {
        if (!item?.date || !item?.reminder || item.reminder === "none") return;
        if (String(item.status || "").toLowerCase() === "done") return;

        const baseTime = item.startTime || item.time || "23:59";
        const eventDate = new Date(`${item.date}T${baseTime}`);
        if (Number.isNaN(eventDate.getTime())) return;

        const reminderEvery = Number(item.reminderEvery) > 0 ? Number(item.reminderEvery) : 1;
        const reminderUnit = ["minute", "hour", "day", "week"].includes(item.reminderUnit) ? item.reminderUnit : "minute";
        const offsetMs = reminderOffsetMs(item.reminder, reminderEvery, reminderUnit);
        if (offsetMs <= 0) return;

        const triggerTime = new Date(eventDate.getTime() - offsetMs);
        const withinWindow = now >= triggerTime && now <= eventDate;
        if (!withinWindow) return;
        const reminderToken = item.reminder === "custom" ? `${reminderEvery}${reminderUnit}` : item.reminder;

        dueItems.push({
            id: `reminder:${item.id ?? `${item.date}-${item.title}-${baseTime}`}:${reminderToken}`,
            title: item.title || "(Untitled)",
            timeText: `${item.date} ${baseTime}`
        });
    });

    if (pushBrowserNotification && "Notification" in window && Notification.permission === "granted") {
        dueItems.forEach((due) => {
            if (notified.has(due.id)) return;
            try {
                new Notification("Trakly Reminder", {
                    body: `${due.title} is coming up at ${due.timeText}.`
                });
                notified.add(due.id);
            } catch (error) {
                console.error("Browser notification failed:", error);
            }
        });
        sessionStorage.setItem("traklyReminderNotified", JSON.stringify(Array.from(notified)));
    }

    const message = dueItems.length > 0
        ? `${dueItems.length} reminder(s) are currently within reminder window.`
        : "No reminders due right now.";

    sessionStorage.setItem("traklyReminderDueCount", String(dueItems.length));
    sessionStorage.setItem("traklyLastReminderCheck", message);

    window.dispatchEvent(new CustomEvent("trakly:reminder-status", {
        detail: {
            dueCount: dueItems.length,
            message
        }
    }));
    window.dispatchEvent(new CustomEvent("trakly:notifications-updated"));
}

// Dismiss panels (search results, notifications) when clicking outside or pressing Escape
function initShellDismissBehavior() {
    document.addEventListener("click", (e) => {
        if (globalSearchWrap && globalSearchResults && !globalSearchWrap.contains(e.target)) {
            globalSearchResults.classList.remove("is-open");
        }

        const isInNotif = e.target.closest(".notification-wrap");
        if (notificationPanel && !isInNotif) {
            notificationPanel.classList.remove("is-open");
            notificationPanel.setAttribute("aria-hidden", "true");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        globalSearchResults?.classList.remove("is-open");
        notificationPanel?.classList.remove("is-open");
        notificationPanel?.setAttribute("aria-hidden", "true");
    });
}


// Load the default view (Dashboard) on initial page load
window.addEventListener("DOMContentLoaded", () => {

    applySavedTheme(); // Apply the saved theme preference
    setTopbarDate(); // Set the current date in the topbar
    loadView("dashboard"); // Load the dashboard view by default when the app starts

    const defaultBtn = document.querySelector(".nav-btn[data-view='dashboard']"); // Select the dashboard button

    if(defaultBtn){
        setActiveButton(defaultBtn); 
        updateTopbarTitle(defaultBtn);
    }

    initGlobalSearch(); // Initialize global search functionality
    initNotifications(); // Initialize notifications functionality
    initShellDismissBehavior(); // Initialize behavior to dismiss panels when clicking outside or pressing Escape
    renderNotifications(); // Render notifications on startup to show any pending notices immediately

    runReminderTick({ pushBrowserNotification: true });
    if (window.__traklyReminderEngineIntervalId) {
        window.clearInterval(window.__traklyReminderEngineIntervalId);
    }
    window.__traklyReminderEngineIntervalId = window.setInterval(() => {
        runReminderTick({ pushBrowserNotification: true });
    }, 60000);

    window.addEventListener("trakly:run-reminder-check", () => {
        runReminderTick({ pushBrowserNotification: true });
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) runReminderTick({ pushBrowserNotification: true });
    });
});

// Utility functions for formatting currency, escaping HTML, getting today's date key, and navigating to specific calendar items based on notifications or search results. These functions help maintain consistency and security across the app when displaying data and handling user interactions.
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
    }).format(Number(amount) || 0);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function navigateToCalendarItem({ date, itemId }) {
    if (!date) return;

    sessionStorage.setItem(
        "traklyNavContext",
        JSON.stringify({
            view: "calendar",
            date,
            itemId
        })
    );

    loadView("calendar");
    const navBtn = document.querySelector(`.nav-btn[data-view="calendar"]`);
    if (navBtn) {
        setActiveButton(navBtn);
        updateTopbarTitle(navBtn);
    }
}

// DO NOT TOUCH THIS unless reminders are broken again
// converts preset/custom reminder values to ms so one notification pipeline can handle both
function reminderOffsetMs(reminder, customEvery = 1, customUnit = "minute") {
    if (reminder === "custom") {
        const every = Number(customEvery);
        if (!Number.isFinite(every) || every < 1) return 0;

        const unitMap = {
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000
        };

        return every * (unitMap[customUnit] || unitMap.minute);
    }

    const map = {
        "5m": 5 * 60 * 1000,
        "10m": 10 * 60 * 1000,
        "30m": 30 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000
    };
    return map[reminder] || 0;
}
