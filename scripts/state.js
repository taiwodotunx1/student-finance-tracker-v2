// state.js: holds the records. Every change to the data goes through these functions.

let records = [];
const categories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];
const settings = { budget: 0};
export function getSettings() {
    return settings;
}

export function setBudget(amount) {
    settings.budget = amount;
}

export function getCategories() {
    return categories;
}

export function getRecords() {
    return records;
}

export function addRecord(fields) {
    const now = new Date().toISOString();
    const record = {
        id: 'txn_' + crypto.randomUUID(),
        description: fields.description,
        amount: fields.amount,
        category: fields.category,
        date: fields.date,
        createdAt: now,
        updatedAt: now
    };
    records.push(record);
    return record;
}

export function updateRecord(id, fields) {
    const record = records.find(r => r.id === id);
    if (!record) {
        return;
    }
    record.description = fields.description;
    record.amount = fields.amount;
    record.category = fields.category;
    record.date = fields.date;
    record.updatedAt = new Date().toISOString();
}

export function deleteRecord(id) {
    records = records.filter(r => r.id !== id);
}

// Return a sorted copy of the list; the original order is left alone.
export function sortRecords(list, key, ascending) {
    const sorted = list.slice();
    if (key === 'amount') {
        sorted.sort((a, b) => a.amount - b.amount);
    } else {
        sorted.sort((a, b) => a[key].localeCompare(b[key]));
    }
    if (!ascending) {
        sorted.reverse();
    }
    return sorted;
}

// Add up the amounts of every record in the list.
export function getTotal(list) {
    let total = 0;
    for (const record of list) {
        total += record.amount;
    }
    return total;
}

// The category with the most money spent ('' if there are no records).
export function getTopCategory(list) {
    const totals = {};
    for (const record of list) {
        if (totals[record.category] === undefined) {
            totals[record.category] = 0;
        }
        totals[record.category] += record.amount;
    }

    let topCategory = '';
    let topAmount = -1;
    for (const category in totals) {
        if (totals[category] > topAmount) {
            topCategory = category;
            topAmount = totals[category];
        }
    }
    return topCategory;
}

// Totals for each of the last 7 days, oldest first: [{ date, total }, …]
export function getLastSevenDays(list) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateText = toDateText(date);

        let total = 0;
        for (const record of list) {
            if (record.date === dateText) {
                total += record.amount;
            }
        }
        days.push({ date: date, total: total });
    }
    return days;
}

// A Date as "YYYY-MM-DD" in the user's own time zone.
function toDateText(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}