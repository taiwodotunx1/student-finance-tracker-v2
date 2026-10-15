import { formatMoney } from './state.js';
import { highlight } from './search.js';

// ui.js: draws records, stats and messages on the page.

const statusBox = document.getElementById('status');
const tableBody = document.getElementById('records-body');
const cardList = document.getElementById('record-cards');
const emptyState = document.getElementById('empty-state');
const statCount = document.getElementById('stat-count');
const statTotal = document.getElementById('stat-total');
const statTop = document.getElementById('stat-top');
const chart = document.getElementById('chart');
const chartLabels = document.getElementById('chart-labels');
const statLeft = document.getElementById('stat-left');
const budgetProgress = document.getElementById('budget-progress');
const capOver = document.getElementById('cap-over');
const capOk = document.getElementById('cap-ok');

let statusTimer;

// Show a short message (e.g. "Expense added.") that disappears after 3 seconds.
export function showStatus(message) {
    statusBox.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
        statusBox.textContent = '';
    }, 3000);
}

// Show "No expenses yet." / "No matches…", or hide the message when '' is given.
export function showEmptyState(message) {
    emptyState.textContent = message;
    emptyState.hidden = message === '';
}

// fill in the dashboard numbers.
export function renderStats(count, total, topCategory) {
    statCount.textContent = count;
    statTotal.textContent = formatMoney(total);
    if (topCategory === '') {
        statTop.textContent = '-';
    }
    else {
        statTop.textContent = topCategory;
    }
}

// Redraw every record as a table row (laptop/tablet) and a card (phone).
// newId (optional) fades in a newly added record; editingId shows one record as inputs.
// regex (optional) highlights search matches.
export function renderRecords(records, newId, editingId, regex) {
    tableBody.replaceChildren();
    cardList.replaceChildren();

    for (const record of records) {
        let row;
        let card;
        if (record.id === editingId) {
            row = createEditRow(record);
            card = createEditCard(record);
        } else {
            row = createRow(record, regex);
            card = createCard(record, regex);
        }
        if (record.id === newId) {
            row.classList.add('row-enter');
            card.classList.add('row-enter');
        }
        tableBody.append(row);
        cardList.append(card);
    }
}

function createRow(record, regex) {
    const row = document.createElement('tr');
    row.dataset.id = record.id;

    const actions = document.createElement('td');
    actions.append(createButton('Edit', 'edit', record), createButton('Delete', 'delete', record));

    row.append(
        createCell(highlight(record.date, regex)),
        createCell(highlight(record.description, regex)),
        createCell(highlight(formatMoney(record.amount), regex)),
        createCell(highlight(record.category, regex)),
        actions
    );
    return row;
}

function createCell(content) {
    const cell = document.createElement('td');
    cell.append(content);
    return cell;
}

// A button for one record, e.g. "Delete". The aria-label adds which record,
// so screen readers hear "Delete Lunch at cafeteria", not just "Delete".
function createButton(text, action, record) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.dataset.action = action;
    button.setAttribute('aria-label', text + ' ' + record.description);
    return button;
}

function createCard(record, regex) {
    const card = document.createElement('li');
    card.dataset.id = record.id;

    const title = document.createElement('h3');
    title.append(highlight(record.description, regex));

    const details = document.createElement('p');
    details.append(highlight(formatMoney(record.amount) + ' · ' + record.category + ' · ' + record.date, regex));
    
    card.append(title, details, createButton('Edit', 'edit', record), createButton('Delete', 'delete', record));
    return card;
}

// The editing version of a row: inputs instead of text, Save/Cancel instead of Edit/Delete.
function createEditRow(record) {
    const row = document.createElement('tr');
    row.dataset.id = record.id;
    const fields = createEditFields(record);

    const actions = document.createElement('td');
    actions.append(createButton('Save', 'save', record), createButton('Cancel', 'cancel', record));

    row.append(
        createCell(fields.date),
        createCell(fields.description),
        createCell(fields.amount),
        createCell(fields.category),
        actions
    );
    return row;
}

function createEditCard(record) {
    const card = document.createElement('li');
    card.dataset.id = record.id;
    const fields = createEditFields(record);

    card.append(
        fields.date,
        fields.description,
        fields.amount,
        fields.category,
        createButton('Save', 'save', record),
        createButton('Cancel', 'cancel', record)
    );
    return card;
}

function createEditFields(record) {
    return {
        date: createInput('date', 'Date', record.date),
        description: createInput('text', 'Description', record.description),
        amount: createInput('text', 'Amount', String(record.amount)),
        category: createInput('text', 'Category', record.category)
    };
}

function createInput(type, label, value) {
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.dataset.field = label.toLowerCase();
    input.setAttribute('aria-label', label);
    return input;
}

// Tell screen readers which column the table is sorted by.
export function showSortState(key, ascending) {
    for (const header of document.querySelectorAll('th[data-sort]')) {
        if (header.dataset.sort !== key) {
            header.removeAttribute('aria-sort');
        } else if (ascending) {
            header.setAttribute('aria-sort', 'ascending');
        } else {
            header.setAttribute('aria-sort', 'descending');
        }
    }
}

// One bar per day. The tallest bar is the biggest day; each bar has a text label for screen readers.
export function renderChart(days) {
    chart.replaceChildren();
    chartLabels.replaceChildren();

    let biggest = 0;
    for (const day of days) {
        if (day.total > biggest) {
            biggest = day.total;
        }
    }

    for (const day of days) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        let height = 0;
        if (biggest > 0) {
            height = (day.total / biggest) * 100;
        }
        bar.style.height = height + '%';
        bar.setAttribute('role', 'img');
        bar.setAttribute('aria-label', day.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ': ' + formatMoney(day.total));
        chart.append(bar);

        const label = document.createElement('span');
        label.textContent = day.date.toLocaleDateString('en-GB', { weekday: 'short' });
        chartLabels.append(label);
    }

}

// only change the text if it's different, so live regions don't repeat themselves on every redraw.
function setText(element, text) {
    if (element.textContent !== text) {
        element.textContent = text;
    }
}

//Budget bar. "left" stat and message: polite (status) when under, assertive (alert) when over.
export function renderBudget(budget, total) {
    if (budget === 0) {
        statLeft.textContent = '-';
        budgetProgress.value = 0;
        setText(capOk, 'No budget set yet. Add one in Settings');
        setText(capOver, '');
        return;    
    }

    const left = budget - total;
    budgetProgress.value = (total / budget) * 100;

    if (left >= 0) {
        statLeft.textContent = formatMoney(left);
        setText(capOver, '');
        setText(capOk, formatMoney(left) + ' left of your ' + formatMoney(budget) + ' budget.');
    }
    else {
        statLeft.textContent = 'Over ' + formatMoney(-left);
        setText(capOk, '');
        setText(capOver, 'Over budget by ' + formatMoney(-left) + '.');
    }
}