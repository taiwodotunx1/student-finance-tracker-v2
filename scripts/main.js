import { validateDescription, cleanDescription, validateAmount, validateDate, checkDuplicateWord } from './validators.js';
import { addRecord, getRecords, deleteRecord, updateRecord, sortRecords } from './state.js';
import { showStatus, renderRecords, showSortState, showEmptyState } from './ui.js';
import { compileRegex, matchesSearch } from './search.js';

const form = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const clearButton = document.getElementById('clear-btn');
const descriptionWarning = document.getElementById('description-warning');
const categorySelect = document.getElementById('category');
const recordsSection = document.getElementById('records');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const caseToggle = document.getElementById('case-toggle');
const matchCount = document.getElementById('match-count');

let editingId = null;

//  Show a field's error message (or clear it when message is '').
function showError(input, message) {
    const errorBox = document.getElementById(input.id + '-error');
    errorBox.textContent = message;

    if (message === '') {
        input.removeAttribute('aria-invalid');
    }
    else {
        input.setAttribute('aria-invalid', 'true');
    }
}

// each check shows its message and returns true if the field is valid.
function checkDescription() {
    const message = validateDescription(descriptionInput.value);
    showError(descriptionInput, message);
    descriptionWarning.textContent = checkDuplicateWord(descriptionInput.value);
    return message === '';
}

function checkAmount() {
    const message = validateAmount(amountInput.value);
    showError(amountInput, message);
    return message === '';
}

function checkDate() {
    const message = validateDate(dateInput.value);
    showError(dateInput, message);
    return message === '';
}

function clearForm() {
    form.reset();
    showError(descriptionInput, '');
    showError(amountInput, '');
    showError(dateInput, '');
    descriptionWarning.textContent = ''
}

// Check each field while the user types.
descriptionInput.addEventListener('input', checkDescription);
amountInput.addEventListener('input', checkAmount);
dateInput.addEventListener('change', checkDate);
clearButton.addEventListener('click', clearForm);

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const descriptionOK = checkDescription();
    const amountOK = checkAmount();
    const dateOK = checkDate();

    if (descriptionOK && amountOK && dateOK) {

        const newRecord = addRecord({
            description: cleanDescription(descriptionInput.value),
            amount: Number(amountInput.value),
            category: categorySelect.value,
            date: dateInput.value
        });

        refresh(newRecord.id);
        showStatus('Expense added.');

        clearForm();
        descriptionInput.focus();
    }
    else {
        form.querySelector('[aria-invalid="true"]').focus();
    }
});

function deleteExpense(id) {
    const record = getRecords().find(r => r.id === id);
    if (!confirm('Delete "' + record.description + '"?')) {
        return;
    }
    deleteRecord(id);
    refresh();
    showStatus('Expense deleted.');
    searchInput.focus();
}

// Sort, search, then draw. Every change to the records list goes through here.
function refresh(newId) {
    const parts = sortSelect.value.split('-');
    const key = parts[0];
    const ascending = parts[1] === 'asc';
    let  list = sortRecords(getRecords(), key, ascending);

    const ignoreCase = caseToggle.getAttribute('aria-pressed') === 'true';
    const search = compileRegex(searchInput.value, ignoreCase);
    showError(searchInput, search.error);
    if (search.regex) {
        list = list.filter(record => matchesSearch(record, search.regex));
        matchCount.textContent = 'Matches: ' + list.length;
    } else {
        matchCount.textContent = '';
    }

    renderRecords(list, newId, editingId, search.regex);
    showSortState(key, ascending);

    if (getRecords().length === 0) {
        showEmptyState('No expenses yet.');
    } else if (list.length === 0) {
        showEmptyState('No matches for this pattern.');
    } else {
        showEmptyState('');
    }
}

// Each record is drawn twice (table row + phone card) and CSS hides one.
// focus() does nothing on a hidden element, so focusing both lands on the visible one.
function focusInRecord(id, selector) {
    for (const element of document.querySelectorAll('[data-id="' + id + '"] ' + selector)) {
        element.focus();
    }
}

function startEdit(id) {
    editingId = id;
    refresh();
    focusInRecord(id, '[data-field="description"]');
}

function cancelEdit() {
    const id = editingId;
    editingId = null;
    refresh();
    focusInRecord(id, '[data-action="edit"]');
}

// Mark an edit field valid or invalid, and return its error message ('' if fine).
function checkEditField(input, validator) {
    const message = validator(input.value);
    if (message === '') {
        input.removeAttribute('aria-invalid');
    } else {
        input.setAttribute('aria-invalid', 'true');
    }
    return message;
}

function saveEdit(id, button) {
    const container = button.closest('[data-id]');
    const description = container.querySelector('[data-field="description"]');
    const amount = container.querySelector('[data-field="amount"]');
    const category = container.querySelector('[data-field="category"]');
    const date = container.querySelector('[data-field="date"]');

    const descriptionError = checkEditField(description, validateDescription);
    const amountError = checkEditField(amount, validateAmount);
    const dateError = checkEditField(date, validateDate);

    if (descriptionError !== '' || amountError !== '' || dateError !== '') {
        showStatus((descriptionError + ' ' + amountError + ' ' + dateError).trim());
        container.querySelector('[aria-invalid="true"]').focus();
        return;
    }

    updateRecord(id, {
        description: cleanDescription(description.value),
        amount: Number(amount.value),
        category: category.value,
        date: date.value
    });
    editingId = null;
    refresh();
    showStatus('Expense updated.');
    focusInRecord(id, '[data-action="edit"]');
}

// One listener for every Edit/Delete/Save/Cancel button in the table and cards.
recordsSection.addEventListener('click', function (event) {
    const button = event.target;
    const action = button.dataset.action;
    if (!action) {
        return;
    }
    const id = button.closest('[data-id]').dataset.id;

    if (action === 'edit') {
        startEdit(id);
    } else if (action === 'save') {
        saveEdit(id, button);
    } else if (action === 'cancel') {
        cancelEdit();
    } else if (action === 'delete') {
        deleteExpense(id);
    }
});

// Esc cancels an edit.
recordsSection.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && editingId !== null) {
        cancelEdit();
    }
});

sortSelect.addEventListener('change', function () {
    refresh();
});

searchInput.addEventListener('input', function () {
    refresh();
});

caseToggle.addEventListener('click', function () {
    const pressed = caseToggle.getAttribute('aria-pressed') === 'true';
    caseToggle.setAttribute('aria-pressed', String(!pressed));
    refresh();
});

// Draw the page once when the app starts.
refresh();
