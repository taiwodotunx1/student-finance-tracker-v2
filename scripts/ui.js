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

// Redraw every record as a table row (laptop/tablet) and a card (phone).
// newId (optional) marks the record that was just added, so it fades in.
export function renderRecords(records, newId) {
    tableBody.replaceChildren();
    cardList.replaceChildren();

    for (const record of records) {
        const row = createRow(record);
        const card = createCard(record);
        if (record.id === newId) {
            row.classList.add('row-enter');
            card.classList.add('row-enter');
        }
        tableBody.append(row);
        cardList.append(card);
    }

    emptyState.hidden = records.length > 0;
}

function createRow(record) {
    const row = document.createElement('tr');
    row.dataset.id = record.id;
    row.append(
        createCell(record.date),
        createCell(record.description),
        createCell(record.amount.toFixed(2)),
        createCell(record.category),
        createCell('')
    );
    return row;
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function createCard(record) {
    const card = document.createElement('li');
    card.dataset.id = record.id;

    const title = document.createElement('h3');
    title.textContent = record.description;

    const details = document.createElement('p');
    details.textContent = record.amount.toFixed(2) + ' · ' + record.category + ' · ' + record.date;
    
    card.append(title, details);
    return card;
}