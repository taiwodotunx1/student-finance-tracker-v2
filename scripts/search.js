import { formatMoney } from './state.js';
// search.js: turns the user's search text into a regex, filters records, and highlights matches safely.
// Build a regex from what the user typed. A broken pattern like "[" returns an error instead of crashing.

export function compileRegex(text, ignoreCase) {
    if (text === '') {
        return { regex: null, error: '' };
    }
    let flags = '';
    if (ignoreCase) {
        flags = 'i';
    }
    try {
        return { regex: new RegExp(text, flags), error: '' };
    } catch {
        return { regex: null, error: 'Invalid pattern.' };
    }
}

// Does any visible field of this record match?
export function matchesSearch(record, regex) {
    return regex.test(record.description)
        || regex.test(record.category)
        || regex.test(formatMoney(record.amount))
        || regex.test(record.date);
}

// Return the text with every match wrapped in <mark>, built with real elements (never innerHTML).
export function highlight(text, regex) {
    const fragment = document.createDocumentFragment();
    if (!regex) {
        fragment.append(text);
        return fragment;
    }

    const globalRegex = new RegExp(regex.source, regex.flags + 'g');
    let last = 0;
    for (const match of text.matchAll(globalRegex)) {
        if (match[0] === '') {
            continue; // skip empty matches, e.g. from "a*"
        }
        fragment.append(text.slice(last, match.index));
        const mark = document.createElement('mark');
        mark.textContent = match[0];
        fragment.append(mark);
        last = match.index + match[0].length;
    }
    fragment.append(text.slice(last));
    return fragment;
}

