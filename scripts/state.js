// state.js: holds the records. Every change to the data goes through these functions.

let records = [];
const settings = {
    budget: 0,
    currency: 'RWF',
    rates: { USD: 0.00069, NGN: 1.07 }
};
export function getSettings() {
    return settings;
}

export function setBudget(amount) {
    settings.budget = amount;
}

export function setCurrency(code) {
    settings.currency = code;
}

export function setRate(code, rate) {
    settings.rates[code] = rate;
}

export function getRecords() {
    return records;
}

export function setRecords(list) {
    records = list;
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
    } else if (key === 'description') {
        sorted.sort((a, b) => a.description.localeCompare(b.description));
    } else {
        sorted.sort((a, b) => a.date.localeCompare(b.date));
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

// The category with the most money spent ('' if nothing has been spent).
export function getTopCategory(list) {
    let topCategory = '';
    let topAmount = 0;
    for (const record of list) {
        const amount = getTotal(list.filter(r => r.category === record.category));
        if (amount > topAmount) {
            topCategory = record.category;
            topAmount = amount;
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

// An amount (stored in RWF) as text in the chosen currency, e.g. "2500.00 RWF" or "1.73 USD".
export function formatMoney(amount) {
    let value = amount;
    if (settings.currency !== 'RWF') {
        value = amount * settings.rates[settings.currency];
    }
    return value.toFixed(2) + ' ' + settings.currency;
}