// state.js: holds the records. Every change to the data goes through these functions.

let records = [];
const categories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

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