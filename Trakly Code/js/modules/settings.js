import { storage } from "./storage.js";

const DEFAULT_PROFILE = {
    name: "User"
};
// import supports two strategies: overwrite (replace all) and merge (append/merge safely)
const IMPORT_MODE = {
    OVERWRITE: "overwrite",
    MERGE: "merge"
};

//Render the settings view UI 
export function renderSettings() {
    const profile = normalizeProfile(storage.getProfile());
    const theme = storage.getTheme();
    const taskEventCount = storage.getTaskEvents().length;
    const transactionCount = storage.getTransactions().length;
    const budget = storage.getMonthlyBudget();
    const reminderStatus = getReminderSystemStatus();

    return `
        <div class="container settings-shell">
            <h2>Settings & Backup</h2>
            <p class="text-muted">Manage profile, data, theme, and notifications</p>

            <div class="row g-3 mt-3">
                <div class="col-12">
                    <div class="card p-4">
                        <h5>Profile</h5>
                        <p class="text-muted mb-3">Your avatar is auto-generated from the first initial of your name.</p>

                        <div class="row g-3 align-items-end">
                            <div class="col-md-8">
                                <label class="form-label" for="profileNameInput">Your Name</label>
                                <input class="form-control" id="profileNameInput" value="${escapeHtml(profile.name)}" />
                                <small class="text-muted">This name appears in sidebar, topbar, and dashboard greeting.</small>
                            </div>
                            <div class="col-md-4">
                                <div class="border rounded p-2 text-center">
                                    <small class="text-muted d-block">Avatar Preview</small>
                                    <strong id="profileAvatarPreview">${escapeHtml(profile.avatar)}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3">
                            <button class="btn btn-outline-success" id="saveProfileBtn" type="button">
                                <i class="bi bi-check-lg me-1"></i>Save Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="card p-4">
                        <h5>Data Summary</h5>
                        <p class="mb-3"><strong>Current modules:</strong> Dashboard, Calendar, Finance, Settings, About</p>
                        <div class="row g-3 text-center">
                            <div class="col-md-4">
                                <div class="border rounded p-3">
                                    <h3 class="mb-1" id="stateTaskCount">${taskEventCount}</h3>
                                    <small class="text-muted">Tasks & Events</small>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="border rounded p-3">
                                    <h3 class="mb-1" id="stateTransactionCount">${transactionCount}</h3>
                                    <small class="text-muted">Transactions</small>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="border rounded p-3">
                                    <h3 class="mb-1" id="stateBudget">${formatCurrency(budget)}</h3>
                                    <small class="text-muted">Monthly Budget</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card p-4 h-100">
                        <h5>Data Portability - JSON Backup</h5>
                        <p class="text-muted mb-3">Export or import app data as JSON.</p>

                        <div class="d-flex flex-wrap gap-2 mb-2">
                            <button class="btn btn-outline-secondary" id="exportBackupBtn" type="button">
                                <i class="bi bi-download me-1"></i>Export Backup
                            </button>

                            <label class="btn btn-outline-secondary mb-0" for="importBackupInput">
                                <i class="bi bi-upload me-1"></i>Import Backup
                            </label>
                            <input id="importBackupInput" type="file" accept=".json,application/json" hidden />
                        </div>

                        <small class="text-muted">
                            Import supports <strong>Overwrite</strong> and <strong>Add/Merge</strong> modes.
                        </small>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card p-4 h-100">
                        <h5>Appearance</h5>
                        <p class="text-muted mb-3">Control the visual theme of Trakly.</p>

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Current theme</span>
                            <strong id="settingsThemeLabel">${escapeHtml(capitalize(theme))}</strong>
                        </div>

                        <button class="btn btn-outline-primary" id="settingsThemeToggleBtn" type="button">
                            <i class="bi bi-moon-stars me-1"></i>Toggle Theme
                        </button>
                    </div>
                </div>

                <div class="col-12">
                    <div class="card p-4">
                        <h5>Notifications</h5>
                        <p class="text-muted mb-3">Enable browser notifications for Trakly alerts.</p>

                        <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                            <div>
                                <h6 class="mb-1">Browser Notifications</h6>
                                <p class="mb-1 text-muted">
                                    Status: <strong id="browserNotifStatusText">${escapeHtml(reminderStatus.permissionLabel)}</strong>
                                </p>
                                <small class="text-muted">If denied, reset permission from browser site settings.</small>
                            </div>
                            <button class="btn btn-primary" id="enableBrowserNotifBtn" type="button">
                                <i class="bi bi-bell me-1"></i>Enable
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="card border-danger p-4">
                        <h5 class="text-danger">Danger Zone</h5>
                        <p class="text-muted mb-3">Permanently deletes tasks, events, transactions, budget, profile, and notification history.</p>
                        <button class="btn btn-danger" id="clearAllDataBtn" type="button">
                            <i class="bi bi-trash me-1"></i>Clear All
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="importModeModal" class="settings-import-modal" aria-hidden="true">
            <div class="settings-import-dialog" role="dialog" aria-modal="true" aria-labelledby="importModeTitle">
                <h3 id="importModeTitle" class="settings-import-title">Import Backup</h3>
                <p class="settings-import-subtitle">How would you like to import this backup?</p>

                <div class="settings-import-actions">
                    <button id="importOverwriteBtn" class="btn btn-danger" type="button">Overwrite</button>
                    <button id="importMergeBtn" class="btn btn-primary" type="button">Add / Merge</button>
                    <button id="importCancelBtn" class="btn btn-secondary" type="button">Cancel</button>
                </div>

                <p class="settings-import-note">
                    <strong>Overwrite</strong> replaces all current data.<br>
                    <strong>Add / Merge</strong> keeps existing data and adds new unique entries.
                </p>
            </div>
        </div>
    `;
}

export function setupSettings() {
    const settingsThemeToggleBtn = document.getElementById("settingsThemeToggleBtn");
    const shellThemeToggleBtn = document.getElementById("themeToggleBtn");
    const themeLabel = document.getElementById("settingsThemeLabel");

    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const profileNameInput = document.getElementById("profileNameInput");
    const profileAvatarPreview = document.getElementById("profileAvatarPreview");

    const exportBackupBtn = document.getElementById("exportBackupBtn");
    const importBackupInput = document.getElementById("importBackupInput");

    const enableBrowserNotifBtn = document.getElementById("enableBrowserNotifBtn");
    const clearAllDataBtn = document.getElementById("clearAllDataBtn");

    if (profileNameInput && profileAvatarPreview) {
        profileNameInput.addEventListener("input", () => {
            profileAvatarPreview.textContent = getInitialFromName(profileNameInput.value || DEFAULT_PROFILE.name);
        });
    }

    if (settingsThemeToggleBtn && shellThemeToggleBtn) {
        settingsThemeToggleBtn.addEventListener("click", () => {
            shellThemeToggleBtn.click();
            if (themeLabel) themeLabel.textContent = capitalize(storage.getTheme());
            showSettingsAlert(`Theme updated: ${capitalize(storage.getTheme())}`, "success");
        });
    }

    if (saveProfileBtn && profileNameInput) {
        saveProfileBtn.addEventListener("click", () => {
            const profile = normalizeProfile({ name: profileNameInput.value });
            storage.setProfile(profile);
            applyProfileToShell(profile);
            showSettingsAlert("Profile saved successfully!", "success");
        });
    }

    if (exportBackupBtn) {
        exportBackupBtn.addEventListener("click", () => {
            const backupData = {
                app: "Trakly",
                version: "1.0",
                exportedAt: new Date().toISOString(),
                data: {
                    tasksevents: storage.getTaskEvents(),
                    transactions: storage.getTransactions(),
                    monthlyBudget: storage.getMonthlyBudget(),
                    theme: storage.getTheme(),
                    profile: normalizeProfile(storage.getProfile()),
                    notifications: {
                        read: storage.getReadNotifications(),
                        dismissed: storage.getDismissedNotifications()
                    }
                }
            };

            const jsonFile = new Blob([JSON.stringify(backupData, null, 2)], {
                type: "application/json"
            });

            const url = URL.createObjectURL(jsonFile);
            const link = document.createElement("a");
            link.href = url;
            link.download = `trakly_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            showSettingsAlert("Backup exported successfully!", "success");
        });
    }

    if (importBackupInput) {
        importBackupInput.addEventListener("change", async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                const parsed = JSON.parse(await file.text());
                const importData = normalizeImportData(parsed);
                const mode = await askImportMode();
                if (!mode) return;

                if (mode === IMPORT_MODE.OVERWRITE) {
                    applyOverwriteImport(importData);
                    showSettingsAlert("Data imported successfully with Overwrite Mode!", "success");
                } else {
                    const result = applyMerge(importData);
                    showSettingsAlert(`Merged successfully: +${result.addedTasks} tasks/events, +${result.addedTransactions} transactions.`, "success");
                }

                if (themeLabel) themeLabel.textContent = capitalize(storage.getTheme());
                applyProfileToShell(normalizeProfile(storage.getProfile()));
                refreshStateSummary();
                refreshNotificationSummary();
                emitNotificationsUpdate();
            } catch (error) {
                console.error(error);
                showSettingsAlert("Import failed: invalid backup file.", "danger");
            } finally {
                importBackupInput.value = "";
            }
        });
    }

    if (enableBrowserNotifBtn) {
        enableBrowserNotifBtn.addEventListener("click", async () => {
            const result = await requestBrowserNotificationPermission();
            refreshNotificationSummary();
            if (result === "granted") {
                try {
                    new Notification("Trakly", { body: "Browser notifications enabled." });
                } catch (error) {
                    console.error("Unable to show confirmation notification:", error);
                }
                showSettingsAlert("Browser notifications enabled.", "success");
            } else if (result === "denied") {
                showSettingsAlert("Permission denied. Allow notifications from browser site settings.", "warning");
            } else if (result === "unsupported") {
                showSettingsAlert("Notifications are not supported in this browser.", "danger");
            } else if (result === "insecure-context") {
                showSettingsAlert("Notifications need a secure context (https:// or localhost).", "danger"); // browser notifications require secure context (https or localhost) by platform policy
            } else {
                showSettingsAlert("Notification permission was dismissed.", "info");
            }
        });
    }

    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener("click", () => {
            const confirmed = window.confirm("This will permanently delete all app data. Continue?");
            if (!confirmed) return;

            storage.setTaskEvents([]);
            storage.setTransactions([]);
            storage.setMonthlyBudget(0);
            storage.setReadNotifications([]);
            storage.setDismissedNotifications([]);
            storage.setProfile(normalizeProfile(DEFAULT_PROFILE));
            storage.setTheme("light");
            document.documentElement.setAttribute("data-theme", "light");

            applyProfileToShell(normalizeProfile(storage.getProfile()));
            if (profileNameInput) profileNameInput.value = storage.getProfile().name || DEFAULT_PROFILE.name;
            if (profileAvatarPreview) profileAvatarPreview.textContent = getInitialFromName(profileNameInput?.value || DEFAULT_PROFILE.name);
            if (themeLabel) themeLabel.textContent = "Light";

            refreshStateSummary();
            refreshNotificationSummary();
            emitNotificationsUpdate();
            showSettingsAlert("All app data was cleared.", "warning");
        });
    }

    applyProfileToShell(normalizeProfile(storage.getProfile()));
    refreshStateSummary();
    refreshNotificationSummary();
    emitNotificationsUpdate();
}

function applyOverwriteImport(importData) {
    storage.setTaskEvents(importData.tasksevents);
    storage.setTransactions(importData.transactions);
    storage.setMonthlyBudget(importData.monthlyBudget);
    storage.setTheme(importData.theme);
    document.documentElement.setAttribute("data-theme", importData.theme);
    storage.setProfile(importData.profile);
    storage.setReadNotifications(importData.notifications.read);
    storage.setDismissedNotifications(importData.notifications.dismissed);
}

function applyMerge(importData) {
    const currentTasks = storage.getTaskEvents();
    const currentTransactions = storage.getTransactions();
    const mergedTasks = mergeByKey(currentTasks, importData.tasksevents, taskEventKey, "current");
    const mergedTransactions = mergeByKey(currentTransactions, importData.transactions, transactionKey, "current");

    storage.setTaskEvents(mergedTasks);
    storage.setTransactions(mergedTransactions);
    storage.setMonthlyBudget(Math.max(storage.getMonthlyBudget(), importData.monthlyBudget));

    const read = new Set(storage.getReadNotifications());
    importData.notifications.read.forEach((id) => read.add(id));
    storage.setReadNotifications(Array.from(read));

    const dismissed = new Set(storage.getDismissedNotifications());
    importData.notifications.dismissed.forEach((id) => dismissed.add(id));
    storage.setDismissedNotifications(Array.from(dismissed));

    const addedTasks = mergedTasks.length - currentTasks.length;
    const addedTransactions = mergedTransactions.length - currentTransactions.length;
    return { addedTasks, addedTransactions };
}

function normalizeImportData(raw) {
    const data = raw?.data ?? raw;

    const tasksevents = Array.isArray(data.tasksevents) ? data.tasksevents
        : Array.isArray(data.taskEvents) ? data.taskEvents
        : Array.isArray(data.taskevents) ? data.taskevents
        : Array.isArray(data.tasksEvents) ? data.tasksEvents
        : Array.isArray(data.taskeventItems) ? data.taskeventItems
        : [];

    const transactions = Array.isArray(data.transactions) ? data.transactions
        : Array.isArray(data.transactionsItems) ? data.transactionsItems
        : [];

    const monthlyBudget = Number(data.monthlyBudget) || 0;
    const themeRaw = typeof data.theme === "string" ? data.theme : storage.getTheme();
    const theme = themeRaw === "dark" ? "dark" : "light";
    const profile = normalizeProfile(data.profile || storage.getProfile());

    const read = Array.isArray(data?.notifications?.read) ? data.notifications.read : [];
    const dismissed = Array.isArray(data?.notifications?.dismissed) ? data.notifications.dismissed : [];

    return {
        tasksevents,
        transactions,
        monthlyBudget,
        theme,
        profile,
        notifications: { read, dismissed }
    };
}

function askImportMode() {
    return new Promise((resolve) => {
        const modal = document.getElementById("importModeModal");
        const overwriteBtn = document.getElementById("importOverwriteBtn");
        const mergeBtn = document.getElementById("importMergeBtn");
        const cancelBtn = document.getElementById("importCancelBtn");

        if (!modal || !overwriteBtn || !mergeBtn || !cancelBtn) {
            resolve(null);
            return;
        }

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        mergeBtn.focus();

        function cleanup(result) {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");

            overwriteBtn.removeEventListener("click", onOverwrite);
            mergeBtn.removeEventListener("click", onMerge);
            cancelBtn.removeEventListener("click", onCancel);
            modal.removeEventListener("click", onBackdrop);
            window.removeEventListener("keydown", onEsc);
            resolve(result);
        }

        function onOverwrite() { cleanup(IMPORT_MODE.OVERWRITE); }
        function onMerge() { cleanup(IMPORT_MODE.MERGE); }
        function onCancel() { cleanup(null); }
        function onBackdrop(event) { if (event.target === modal) cleanup(null); }
        function onEsc(event) { if (event.key === "Escape") cleanup(null); }

        overwriteBtn.addEventListener("click", onOverwrite);
        mergeBtn.addEventListener("click", onMerge);
        cancelBtn.addEventListener("click", onCancel);
        modal.addEventListener("click", onBackdrop);
        window.addEventListener("keydown", onEsc);
    });
}

function mergeByKey(currentItems, incomingItems, getKey, prefer = "current") {
    const map = new Map();

    currentItems.forEach((item) => {
        map.set(getKey(item), item);
    });

    incomingItems.forEach((item) => {
        const key = getKey(item);
        if (!map.has(key)) {
            map.set(key, item);
        } else if (prefer === "incoming") {
            map.set(key, item);
        }
    });

    return Array.from(map.values());
}

function taskEventKey(item) {
    if (item?.id != null) return `id:${item.id}`;
    return `f:${item?.type || ""}|${item?.title || ""}|${item?.date || ""}|${item?.time || ""}|${item?.desc || ""}`;
}

function transactionKey(item) {
    if (item?.id != null) return `id:${item.id}`;
    return `f:${item?.date || ""}|${item?.type || ""}|${item?.category || ""}|${item?.amount || ""}|${item?.desc || ""}`;
}

function refreshStateSummary() {
    const stateTaskCount = document.getElementById("stateTaskCount");
    const stateTransactionCount = document.getElementById("stateTransactionCount");
    const stateBudget = document.getElementById("stateBudget");

    if (stateTaskCount) stateTaskCount.textContent = String(storage.getTaskEvents().length);
    if (stateTransactionCount) stateTransactionCount.textContent = String(storage.getTransactions().length);
    if (stateBudget) stateBudget.textContent = formatCurrency(storage.getMonthlyBudget());
}

function refreshNotificationSummary() {
    const status = getReminderSystemStatus();
    const browserStatus = document.getElementById("browserNotifStatusText");

    if (browserStatus) browserStatus.textContent = status.permissionLabel;
}

function getReminderSystemStatus() {
    const permission = getBrowserNotificationPermission();
    const permissionLabel = permission === "granted"
        ? "granted"
        : permission === "denied"
            ? "denied"
            : permission === "default"
                ? "not requested"
                : permission === "insecure-context"
                    ? "insecure context"
                    : "unsupported";

    return { permissionLabel };
}

async function requestBrowserNotificationPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (!window.isSecureContext) return "insecure-context";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    try {
        return await Notification.requestPermission();
    } catch (error) {
        console.error("Notification permission request failed:", error);
        return "unsupported";
    }
}

function getBrowserNotificationPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (!window.isSecureContext) return "insecure-context";
    return Notification.permission;
}

function applyProfileToShell(profileRaw) {
    const profile = normalizeProfile(profileRaw);
    const topbarName = document.getElementById("topbarProfileName");
    const topbarAvatar = document.getElementById("topbarAvatarSm");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    if (topbarName) topbarName.textContent = profile.name;
    if (topbarAvatar) topbarAvatar.textContent = profile.avatar;
    if (sidebarAvatar) sidebarAvatar.textContent = profile.avatar;
}

function normalizeProfile(raw) {
    const name = String(raw?.name || DEFAULT_PROFILE.name).trim() || DEFAULT_PROFILE.name;
    return {
        name,
        avatar: getInitialFromName(name)
    };
}

function getInitialFromName(name) {
    return String(name || DEFAULT_PROFILE.name).trim().charAt(0).toUpperCase() || "U";
}

function showSettingsAlert(message, type = "info") {
    const host = document.getElementById("notification-area");
    if (!host) return;

    const safeType = ["success", "danger", "warning", "info"].includes(type) ? type : "info";
    host.classList.add("toast-stack");

    const toast = document.createElement("div");
    toast.className = `app-toast app-toast-${safeType}`;
    toast.innerHTML = `
        <div class="app-toast-body">${escapeHtml(message)}</div>
        <button type="button" class="app-toast-close" aria-label="Close">
            <i class="bi bi-x-lg"></i>
        </button>
    `;

    host.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    const removeToast = () => {
        toast.classList.remove("is-visible");
        toast.classList.add("is-leaving");
        window.setTimeout(() => toast.remove(), 180);
    };

    const timer = window.setTimeout(removeToast, 3200);
    toast.querySelector(".app-toast-close")?.addEventListener("click", () => {
        window.clearTimeout(timer);
        removeToast();
    }, { once: true });
}


function emitNotificationsUpdate() {
    window.dispatchEvent(new CustomEvent("trakly:notifications-updated"));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
    }).format(Number(amount) || 0);
}

function capitalize(value) {
    const text = String(value || "light");
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
