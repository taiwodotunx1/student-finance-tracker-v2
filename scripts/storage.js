// storage.js: saves and loads data in the browser's localstorage.

const RECORDS_KEY = 'finance-tracker:records';
const SETTINGS_KEY = 'finance-tracker:settings';

//saved records, or [] if there are none or the saved data is broken.

export function loadRecords() {
    try {
        const data = JSON.parse(localStorage.getItem(RECORDS_KEY));
        if (Array.isArray(data)) {
            return data;
        }
    }
    catch {
        // Broken data: fail through and start empty instead of crashing.
    }
    return [];
}

export function saveRecords(records) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
    catch {
        // Storage full or blocked: keep working without saving.
    }
}

// Sved settings object, or null if there are none or they're broken
export function loadSettings() {
    try {
        const data = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        if (data !== null && typeof data === 'object') {
            return data;
        }
    }
    catch {
        // Broken data use the deafault settings.
    }
    return null;
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    catch {
        // Storage full or blocked; Keep working without saving.
    }
}