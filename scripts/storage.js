import { isValidRecord, cleanCategory } from "./validators.js";

// storage.js: saves and loads data in the browser's localstorage.
const RECORDS_KEY = 'finance-tracker:records';
const SETTINGS_KEY = 'finance-tracker:settings';

//saved records, or [] if there are none or the saved data is broken.
export function loadRecords() {
    try {
        const data = JSON.parse(localStorage.getItem(RECORDS_KEY));
        if (Array.isArray(data)) {
            return data.filter(isValidRecord);
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

// Download the records as a .json file.
export function exportRecords(records) {
    const text = JSON.stringify(records, null, 2);
    const file = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'finance-records.json';
    link.click();

    URL.revokeObjectURL(url);
}

// Check a whole imported file before using any of it. Returns { records, error }.
export function parseImport(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        return { records: null, error: 'This file is not valid JSON.' };
    }

    if (!Array.isArray(data)) {
        return { records: null, error: 'The file must contain a list of expenses.' };
    }

    const ids = [];
    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        if (!isValidRecord(record)) {
            return { records: null, error: 'Expense ' + (i + 1) + ' has a missing or invalid field.' };
        }
        if (ids.includes(record.id)) {
            return { records: null, error: 'Expense ' + (i + 1) + ' has the same id as an earlier one.' };
        }
        record.category = cleanCategory(record.category);
        ids.push(record.id);
    }

    return { records: data, error: '' };
}