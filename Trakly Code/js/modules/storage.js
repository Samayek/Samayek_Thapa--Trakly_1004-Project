// This js file is to create one storage for all the data of the app, such as user preferences, project data, etc. This will be used to store and retrieve data across different modules and views in a consistent way. It will also handle saving to localStorage or any future backend integration for persistence.

const KEYS_PREFIX = {
    TASK_EVENT: "taskeventItems",
    TRANSACTIONS: "transactions",
    MONTHLY_BUDGET: "monthlyBudget",
    THEME: "traklyTheme",
    PROFILE: "traklyProfile",
    NOTIFICATIONS_READ: "traklyNotificationsRead",
    NOTIFICATIONS_DISMISSED: "traklyNotificationsDismissed"
};

// Function to read JSON data from localStorage with error handling and fallback
function readJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error(`Error reading data for key: ${key}`, error);
        return fallback;
    }
}

// Function to save data to localStorage
function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving data for key: ${key}`, error);
    }
}

// This Storage object will be the central point for all data interactions in the app, providing methods to get and set data for different modules while abstracting away the underlying storage mechanism (currently localStorage, but can be extended to support backend APIs in the future).
export const storage = {
    // Task/Event
    getTaskEvents: () => readJSON(KEYS_PREFIX.TASK_EVENT, []),
    setTaskEvents: (items) => writeJSON(KEYS_PREFIX.TASK_EVENT, items),

    getTaskEventById: (id) => {
        const items = readJSON(KEYS_PREFIX.TASK_EVENT, []);
        return items.find((item) => Number(item.id) === Number(id)) || null;
    },

// Update + Insert: The upsertTaskEvent method will handle both creating new task/events (when no id is provided) and updating existing ones (when an id is provided). It ensures that the data structure remains consistent and abstracts the logic of determining whether to add or update an item.
    upsertTaskEvent: (item) => {
        const items = readJSON(KEYS_PREFIX.TASK_EVENT, []);

        if (item?.id == null) {
            const newItem = { ...item, id: Date.now() };
            items.push(newItem);
            writeJSON(KEYS_PREFIX.TASK_EVENT, items);
            return newItem;
        }

        const index = items.findIndex((x) => Number(x.id) === Number(item.id));
        if (index === -1) {
            items.push(item);
        } else {
            items[index] = { ...items[index], ...item };
        }

        writeJSON(KEYS_PREFIX.TASK_EVENT, items);
        return item;
    },
// The deleteTaskEventById method will remove a task/event from storage based on its id. It filters out the item with the matching id and saves the updated list back to storage, ensuring that the deletion is handled cleanly and efficiently.
    deleteTaskEventById: (id) => {
        const items = readJSON(KEYS_PREFIX.TASK_EVENT, []);
        const next = items.filter((item) => Number(item.id) !== Number(id));
        writeJSON(KEYS_PREFIX.TASK_EVENT, next);
        return next;
    },

    // Finance
    getTransactions: () => readJSON(KEYS_PREFIX.TRANSACTIONS, []),
    setTransactions: (items) => writeJSON(KEYS_PREFIX.TRANSACTIONS, items),
    getTransactionById: (id) => {
        const items = readJSON(KEYS_PREFIX.TRANSACTIONS, []);
        return items.find((item) => Number(item.id) === Number(id)) || null;
    },
    upsertTransaction: (item) => {
        const items = readJSON(KEYS_PREFIX.TRANSACTIONS, []);

        if (item?.id == null) {
            const newItem = { ...item, id: Date.now() };
            items.push(newItem);
            writeJSON(KEYS_PREFIX.TRANSACTIONS, items);
            return newItem;
        }

        const index = items.findIndex((x) => Number(x.id) === Number(item.id));
        if (index === -1) {
            items.push(item);
        } else {
            items[index] = { ...items[index], ...item };
        }

        writeJSON(KEYS_PREFIX.TRANSACTIONS, items);
        return item;
    },
    deleteTransactionById: (id) => {
        const items = readJSON(KEYS_PREFIX.TRANSACTIONS, []);
        const next = items.filter((item) => Number(item.id) !== Number(id));
        writeJSON(KEYS_PREFIX.TRANSACTIONS, next);
        return next;
    },

    // Budget
    getMonthlyBudget: () => Number(localStorage.getItem(KEYS_PREFIX.MONTHLY_BUDGET)) || 0,
    setMonthlyBudget: (n) => localStorage.setItem(KEYS_PREFIX.MONTHLY_BUDGET, String(n)),

    // Theme & Profile
    getTheme: () => localStorage.getItem(KEYS_PREFIX.THEME) || "light",
    setTheme: (v) => localStorage.setItem(KEYS_PREFIX.THEME, v),
    getProfile: () => readJSON(KEYS_PREFIX.PROFILE, { name: "User", avatar: "T" }),
    setProfile: (p) => writeJSON(KEYS_PREFIX.PROFILE, p),

    // Notifications
    getReadNotifications: () => readJSON(KEYS_PREFIX.NOTIFICATIONS_READ, []),
    setReadNotifications: (items) => writeJSON(KEYS_PREFIX.NOTIFICATIONS_READ, items),
    getDismissedNotifications: () => readJSON(KEYS_PREFIX.NOTIFICATIONS_DISMISSED, []),
    setDismissedNotifications: (items) => writeJSON(KEYS_PREFIX.NOTIFICATIONS_DISMISSED, items)
};
