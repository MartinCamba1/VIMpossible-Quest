/*      Constants and Global Variables      */

import { state } from "./globals.js";
import { updateCursor } from "./cursor.js";
import { 
    isChallengeFinished, 
    pickNewChallenge 
} from "./gameMechanics.js";

const punctuations = [
  ".", ",", ";", ":", "!", "?", "'", "\"",
  "(", ")", "[", "]", "{", "}",
  "-", "+", "=", "*", "/", "\\", "|",
  "<", ">", "@", "#", "$", "%", "^", "&",
  "~", "`"
]

const modeEl = document.getElementById("mode-text");

/*----------------------------------*/


/*      Commands available for the player to unlock.        */

// Deletes the character the cursor is on currently.
export function deleteChar() {
    state.characters[state.cursor.row].splice(state.cursor.col, 1);
    let span = state.spans[state.cursor.row][state.cursor.col]
    let needNewChallenge = false;
    
    if (isChallengeFinished(state.commands.get("x").type, span)) {
        needNewChallenge = true;
    };
    
    span.remove();
    state.spans[state.cursor.row].splice(state.cursor.col, 1);

    if (state.cursor.col >= state.characters[state.cursor.row].length) {
        state.cursor.col = Math.max(0, state.characters[state.cursor.row].length - 1);
    }
    updateCursor();

    if (needNewChallenge === true) pickNewChallenge();
}

// Deletes a whole line the cursor is on
export function deleteLine() {
    let needNewChallenge = false;
    if (state.brElArr.length > 0) {
        const cursorWasOnLastLine = state.cursor.row == state.characters.length - 1;
        if (state.brElArr.length > 1) {
            state.brElArr[state.cursor.row].remove();
            state.brElArr.splice(state.cursor.row, 1);
        }

        
        for (const span of state.spans[state.cursor.row]) {
            if (isChallengeFinished(["deletion"], span)) {
                needNewChallenge = true;
            }
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

    if (needNewChallenge === true) pickNewChallenge();
}

// Jumps to the next word ahead of the cursor.
export function wCommand() {
    const pos = findNextWordW(state.cursor.row, state.cursor.col);
    state.cursor.row = pos.row;
    state.cursor.col = pos.col;
    updateCursor();
}

// Jumps backwards to the previous word behind the cursor.
export function bCommand() {
    const pos = findPrevWord(state.cursor.row, state.cursor.col);
    state.cursor.row = pos.row;
    state.cursor.col = pos.col;
    updateCursor();
}

export function eCommand() {
    const pos = findNextWord(state.cursor.row, state.cursor.col);
    let row = pos.row;
    let col = pos.col;

    while (col + 1 < state.characters[row].length && !punctuations.includes(state.characters[row][col + 1]) && state.characters[row][col + 1] != " ") {
        col += 1
    }

    state.cursor.row = row;
    state.cursor.col = col;
    updateCursor();
}

export function $Command() {
    const pos = findEndOfLine(state.cursor.row, state.cursor.col);
    state.cursor.col = pos.col;

    updateCursor();
}

// Deletes the next word ahead of the cursor.

/* Need to add not deleting whitespace such as . after the word */
/* Doesnt delete the first character of the word for some reason. */
    // Need to test it properly on a single punctuation mark.

export function dwCommand() {
    dCommand("w");
}

export function d$Command() {
    const row = state.cursor.row;

    dCommand("$");

    if (state.characters[row].length === 0) {
        ensureRowHasSpan(row);
        state.cursor.col = 0;
    }
    else if (state.cursor.col >= state.characters[row].length) {
        state.cursor.col = state.characters[row].length - 1;
    }
}
// !!!!!!!!!!!!!!!!!!!!!!!!!! Need to add it so it deletes a row when you delete a whole line and pushes other ones up one row
export function dCommand(type) {

    const row = state.cursor.row;
    const col = state.cursor.col;

    let needNewChallenge = false;

    if (punctuations.includes(state.characters[row][col])) {

        const span = state.spans[row][col];

        if (isChallengeFinished("deletion", span)) {
            needNewChallenge = true;
        }

        state.characters[row].splice(col, 1);
        span.remove();
        state.spans[row].splice(col, 1);

        if (needNewChallenge === true) {
            pickNewChallenge();
        }

        return;
    }

    let pos;

    if (type == "w") {
        pos = findNextWordW(row, col);
    }
    else if (type == "e") {
        pos = findNextWordE(row, col);
    }
    else if (type == "$") {
        pos = findEndOfLine(row, col);
    }

    const newRow = pos.row;
    const newCol = pos.col;

    if (newRow === row) {

        let deleteUntil = newCol;

        for (let i = col; i < newCol; i++) {

            if (type != "$" && punctuations.includes(state.characters[row][i])) {
                deleteUntil = i;
                break;
            }

            const span = state.spans[row][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[row].splice(col, deleteUntil - col);
        state.spans[row].splice(col, deleteUntil - col);
    }


    else {
        let deleteFromCurrent = state.spans[row].length;

        for (let i = col; i < state.spans[row].length; i++) {

            if (punctuations.includes(state.characters[row][i])) {
                deleteFromCurrent = i;
                break;
            }

            const span = state.spans[row][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[row].splice(col, deleteFromCurrent - col);
        state.spans[row].splice(col, deleteFromCurrent - col);

        for (let r = row + 1; r < newRow; r++) {

            let deleteUntil = state.spans[r].length;

            for (let i = 0; i < state.spans[r].length; i++) {

                if (punctuations.includes(state.characters[r][i])) {
                    deleteUntil = i;
                    break;
                }

                const span = state.spans[r][i];

                if (isChallengeFinished("deletion", span)) {
                    needNewChallenge = true;
                }

                span.remove();
            }

            state.characters[r].splice(0, deleteUntil);
            state.spans[r].splice(0, deleteUntil);
        }

        let deleteUntil = newCol;

        for (let i = 0; i < newCol; i++) {

            if (punctuations.includes(state.characters[newRow][i])) {
                deleteUntil = i;
                break;
            }

            const span = state.spans[newRow][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[newRow].splice(0, deleteUntil);
        state.spans[newRow].splice(0, deleteUntil);
    }
    console.log(state.spans[newRow]);
    ensureRowHasSpan(newRow);
    console.log(state.spans[newRow]);

    if (needNewChallenge === true) {
        pickNewChallenge();
    }
}

function ensureRowHasSpan(row) {
    if (state.spans[row].length === 0) {
        const span = document.createElement("span");
        span.textContent = "";
        state.spans[row].push(span);
        state.characters[row].push("");

        // Add it to the DOM at the appropriate position
        // depending on how your rows are currently rendered.
    }
}

// Enters insert mode and jumps to the end of the current line.
export function appendAtEndLine() {
    state.mode = "insert";
    modeEl.textContent = "INSERT";
    state.cursor.col = state.spans[state.cursor.row].length;
    updateCursor();
}

// Helper Function used in wCommand and dwCommand
function findNextWordW(inputRow, inputCol) {

    let row = inputRow;
    let col = inputCol + 1;

    while (true) {

        // Skip the rest of the current word
        while (
            col < state.characters[row].length &&
            state.characters[row][col] !== " "
        ) {
            col++;
        }

        // Skip spaces
        while (
            col < state.characters[row].length &&
            state.characters[row][col] === " "
        ) {
            col++;
        }

        // Found the beginning of the next word
        if (col < state.characters[row].length) {
            return { row, col };
        }

        // Reached the end of this logical row
        if (row >= state.characters.length - 1) {
            return {
                row,
                col: state.characters[row].length - 1
            };
        }

        // Continue at the beginning of the next logical row
        row++;
        col = 0;

        // Skip leading spaces on the next row
        while (
            col < state.characters[row].length &&
            state.characters[row][col] === " "
        ) {
            col++;
        }

        if (col < state.characters[row].length) {
            return { row, col };
        }
    }
}


// Helper Function used in bCommand.
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

// Returns the position of the end of the current line
function findEndOfLine(row, col) {
    return {row, col: state.spans[row].length - 1};
}

// gg command jumps to the start of the terminal window
export function ggCommand() {
    state.cursor.row = 0;
    state.cursor.col = 0;
    
    updateCursor();
}

// G command jumps to the last line of the file
export function GCommand() {
    const lastRow = state.spans.length - 1;
    state.cursor.row = lastRow;
    state.cursor.col = 0;

    updateCursor();
}


export function motion(n, func) {
    for (i = 0; i < n; i++) {
        func();
    }
}