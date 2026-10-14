import { validateDescription, validateAmount, validateDate, checkDuplicateWord } from "./validators.js";

const form = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const clearButton = document.getElementById('clear-btn');
const descriptionWarning = document.getElementById('description-warning');

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

        // M4: add the expense to the records here.

        clearForm();
    }
    else {
        form.querySelector('[aria-invalid="true"]').focus();
    }
});
