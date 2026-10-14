import { getCategories } from './state.js';
import { highlight } from './search.js';

// ui.js: draws records, stats and messages on the page.

const statusBox = document.getElementById('status');
const tableBody = document.getElementById('records-body');
const cardList = document.getElementById('record-cards');
const emptyState = document.getElementById('empty-state');

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
        createCell(highlight(record.amount.toFixed(2), regex)),
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
    details.append(highlight(record.amount.toFixed(2) + ' · ' + record.category + ' · ' + record.date, regex));
    
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
        fields.description,
        fields.amount,
        fields.category,
        fields.date,
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
        category: createCategorySelect(record.category)
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

function createCategorySelect(selected) {
    const select = document.createElement('select');
    select.dataset.field = 'category';
    select.setAttribute('aria-label', 'category');
    for (const name of getCategories()) {
        const option = document.createElement('option');
        option.textContent = name;
        select.append(option);
    }
    select.value = selected;
    return select;
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