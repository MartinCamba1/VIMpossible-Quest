
import { state } from "./globals.js";
import { updateCursor } from "./cursor.js";

const punctuations = [
  ".", ",", ";", ":", "!", "?", "'", "\"",
  "(", ")", "[", "]", "{", "}",
  "-", "+", "=", "*", "/", "\\", "|",
  "<", ">", "@", "#", "$", "%", "^", "&",
  "~", "`"
]



export function deleteChar() {
    state.characters[state.cursor.row].splice(state.cursor.col, 1);

    state.spans[state.cursor.row][state.cursor.col].remove();
    state.spans[state.cursor.row].splice(state.cursor.col, 1);

    if (state.cursor.col >= state.characters[state.cursor.row].length) {
        state.cursor.col = Math.max(0, state.characters[state.cursor.row].length - 1);
    }
    updateCursor();
}

export function deleteLine() {
    if (state.brElArr.length > 0) {
        const cursorWasOnLastLine = state.cursor.row == state.characters.length - 1;
        if (state.brElArr.length > 1) {
            state.brElArr[state.cursor.row].remove();
            state.brElArr.splice(state.cursor.row, 1);
        }

        for (const span of state.spans[state.cursor.row]) {
            span.remove();
        }
        if (state.spans.length === 1) {
            state.spans[0].length = 0;
            state.characters[0].length = 0;

            state.cursor.row = 0;
            state.cursor.col = 0;

            updateCursor();
            return;
        }
        else {
            state.spans.splice(state.cursor.row, 1);
            state.characters.splice(state.cursor.row, 1);
        }

        if (cursorWasOnLastLine == true) {
            state.cursor.row--;
            updateCursor();
        }
    }
}

export function wCommand() {
    const pos = findNextWord(state.cursor.row, state.cursor.col);
    state.cursor.row = pos.row;
    state.cursor.col = pos.col;
    updateCursor();
}

export function bCommand() {
    const pos = findPrevWord(state.cursor.row, state.cursor.col);
    state.cursor.row = pos.row;
    state.cursor.col = pos.col;
    updateCursor();
}

/* Need to add not deleting whitespace such as . after the word */
export function dwCommand() {
    const pos = findNextWord(state.cursor.row, state.cursor.col);
    const newRow = pos.row;
    const newCol = pos.col;

    if (state.cursor.row !== newRow) {
        /* Add deleting backwards with function findPrevWord() */
        return;
    }
    state.characters[state.cursor.row].splice(state.cursor.col, (newCol - state.cursor.col));
    
    for (let i = state.cursor.col; i < newCol; i++) {
        state.spans[state.cursor.row][i].remove();
    }
    state.spans[state.cursor.row].splice(state.cursor.col, (newCol - state.cursor.col));


}

export function appendAtEndLine() {
    mode = "insert";
    state.cursor.col = state.spans[state.cursor.row].length;
    updateCursor();
}

function findNextWord(inputRow, inputCol) {
    let row = inputRow;
    let col = inputCol;
    let foundSpace = false;

    for (let i = col + 1; i < state.characters[row].length; i++) {
        const char = state.characters[row][i];

        if (punctuations.includes(char)) return {row, col: i};
        else if (char == " ") {
            foundSpace = true;
            if (row < state.characters.length - 1 && 
                i === state.characters[row].length - 1) {
                    return {row: row + 1, col: 0};
            }
        }
        else {
            if (foundSpace) return {row, col: i};
        }
    }
    if (row < state.characters.length - 1) {
        return {row: row + 1, col: 0};
    }
    return {row, col};
}

function findPrevWord(inputRow, inputCol) {
    let row = inputRow;
    let col = inputCol;
    let resCol = null;

    if (row > 0 && col == 0) return findPrevWord(row - 1, state.characters[row - 1].length);

    for (let i = col - 1; i >= 0; i--) {
        const char = state.characters[row][i];

        if (punctuations.includes(char)) return {row, col: i};
        else if (char == " ") {
            if (resCol !== null) return {row, col: resCol};
        }
        else {
            resCol = i;
        }
    }
    if (resCol !== null) {
        return {row, col: resCol};
    }
    if (row > 0) {
        return findPrevWord(row - 1, state.characters[row - 1].length);
    }
    return {row, col: 0};
}