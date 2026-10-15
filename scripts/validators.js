const descriptionPattern = /^\S(?:.*\S)?$/;
const amountPattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const categoryPattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
const duplicateWordPattern = /\b(\w+)\s+\1\b/i;
const ratePattern = /^(?=.*[1-9])\d+(\.\d{1,6})?$/;

export function validateDescription(text) {
    if (text === '') {
        return 'Description is required.';
    }
    if (!descriptionPattern.test(text)) {
        return 'Remove spaces at the start or end.';
    }
    return '';
}

export function cleanDescription(text) {
    return text.replace(/\s{2,}/g, ' ');
}

// "food", "FOOD" and "Food" all become "Food", so they count as one category.
export function cleanCategory(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function validateAmount(text) {
    if (text === '') {
        return 'Amount is required.';
    }
    if (!amountPattern.test(text)) {
        return 'Enter a number like 12 or 12.50 (up to 2 decimals).';
    }
    return '';
}

export function validateDate(text) {
    if (text === '') {
        return 'Date is required.';
    }
    if (!datePattern.test(text)) {
        return 'Use the format YYYY-MM-DD.';
    }
    if (!isRealDate(text)) {
        return 'That date does not exist.';
    }
    return '';
}

// The pattern allows 2026-02-31, so we'd need to check the date really exists on the calendar
function isRealDate(text) {
    const parts = text.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day;
}

export function validateCategory(text) {
    if (text === '') {
        return 'Category is required.';
    }
    if (!categoryPattern.test(text)) {
        return 'Use letters only, with single spaces or hyphens between words.';
    }
    return '';
}

// A warning, not an error: "Coffee coffee refill" is odd but allowed.
export function checkDuplicateWord(text) {
    const match = text.match(duplicateWordPattern);
    if (match) {
        return 'Repeated word: ' + match[1];
    }
    return '';
}

export function validateRate(text) {
    if (text === '') {
        return 'Rate is required.';
    }
    if (!ratePattern.test(text)) {
        return 'Enter a number above 0, like 0.00069 or 1.07';
    }
    return '';
}

// True if a record (from a file or saved data) has every field in the right format.
export function isValidRecord(record) {
    return record !== null
        && typeof record === 'object'
        && typeof record.id === 'string' && record.id !== ''
        && typeof record.description === 'string' && validateDescription(record.description) === ''
        && typeof record.amount === 'number' && validateAmount(String(record.amount)) === ''
        && typeof record.category === 'string' && validateCategory(record.category) === ''
        && typeof record.date === 'string' && validateDate(record.date) === ''
        && typeof record.createdAt === 'string'
        && typeof record.updatedAt === 'string';
}