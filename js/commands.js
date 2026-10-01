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
// Moves cursor to the end of the current word or if no word is under the cursor to the end of the next word
export function eCommand() {
    const pos = findNextWordE(state.cursor.row, state.cursor.col);
    let row = pos.row;
    let col = pos.col;

    state.cursor.row = row;
    state.cursor.col = col;
    updateCursor();
}

// Moves the cursor to the end of the line.
export function $Command() {
    const pos = findEndOfLine(state.cursor.row, state.cursor.col);
    state.cursor.col = pos.col;

    updateCursor();
}

// Moves the cursor to the start of the line.
export function startOfLineCommand() {
    state.cursor.col = 0;
    
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

export function deCommand() {
    dCommand("e");
}

export function deleteToStartOfLine() {
    const row = state.cursor.row;
    const col = state.cursor.col;

    const start = findStartOfLine(row, col);

    // Already at the first non-whitespace character.
    if (col === start.col) {
        return false;
    }

    let needNewChallenge = false;

    // Delete from first non-whitespace character
    // up to, but NOT including, the cursor.
    for (let i = start.col; i < col; i++) {
        const span = state.spans[row][i];

        if (isChallengeFinished("deletion", span)) {
            needNewChallenge = true;
        }

        span.remove();
    }

    state.characters[row].splice(
        start.col,
        col - start.col
    );

    state.spans[row].splice(
        start.col,
        col - start.col
    );

    ensureRowHasSpan(row);

    if (needNewChallenge) {
        pickNewChallenge();
    }

    return true;
}


// !!!!!!!!!!!!!!!!!!!!!!!!!! Need to add it so it deletes a row when you delete a whole line and pushes other ones up one row
export function dCommand(type) {

    const row = state.cursor.row;
    const col = state.cursor.col;

    let needNewChallenge = false;

    // de on the last character of a logical line:
    // join the next logical line and continue `e` from
    // the first character of that line.
    if (
        type === "e" &&
        col === state.characters[row].length - 1 &&
        row + 1 < state.characters.length
    ) {
        const oldLength = state.characters[row].length;

        joinNextRow(row);

        const pos = findNextWordE(row, oldLength);

        // de includes the character where e lands
        const newCol = pos.col + 1;

        for (let i = col; i < newCol; i++) {

            const span = state.spans[row][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[row].splice(
            col,
            newCol - col
        );

        state.spans[row].splice(
            col,
            newCol - col
        );

        ensureRowHasSpan(row);

        if (needNewChallenge === true) {
            pickNewChallenge();
        }

        return;
    }


    // Delete punctuation directly
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

    if (type === "w") {

        pos = findNextWordW(row, col);

    }

    else if (type === "e") {

        pos = findNextWordE(row, col);

        // de includes the character where e lands
        pos.col += 1;

    }

    else if (type === "$") {

        pos = findEndOfLine(row, col);

    }
    // Doesnt work needs fixing
    else if (type === "^") {

        pos = findStartOfLine(row, col);
        col = Math.max(col - 1, 0);

        let temp = col;
        col = pos.col;
        pos.col = temp;

    }


    const newRow = pos.row;
    const newCol = pos.col;


    // ============================================================
    // Same logical row
    // ============================================================

    if (newRow === row) {

        let deleteUntil = newCol;

        for (let i = col; i < newCol; i++) {

            if (
                type !== "$" &&
                punctuations.includes(state.characters[row][i])
            ) {
                deleteUntil = i;
                break;
            }

            const span = state.spans[row][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[row].splice(
            col,
            deleteUntil - col
        );

        state.spans[row].splice(
            col,
            deleteUntil - col
        );
    }


    // ============================================================
    // Multiple logical rows
    // ============================================================

    else {

        // Delete from cursor to the end of current row
        let deleteFromCurrent = state.characters[row].length;

        for (
            let i = col;
            i < state.characters[row].length;
            i++
        ) {

            if (
                type !== "$" &&
                punctuations.includes(state.characters[row][i])
            ) {
                deleteFromCurrent = i;
                break;
            }

            const span = state.spans[row][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[row].splice(
            col,
            deleteFromCurrent - col
        );

        state.spans[row].splice(
            col,
            deleteFromCurrent - col
        );


        // Delete complete rows in between
        for (let r = row + 1; r < newRow; r++) {

            let deleteUntil = state.characters[r].length;

            for (
                let i = 0;
                i < state.characters[r].length;
                i++
            ) {

                if (
                    type !== "$" &&
                    punctuations.includes(state.characters[r][i])
                ) {
                    deleteUntil = i;
                    break;
                }

                const span = state.spans[r][i];

                if (isChallengeFinished("deletion", span)) {
                    needNewChallenge = true;
                }

                span.remove();
            }

            state.characters[r].splice(
                0,
                deleteUntil
            );

            state.spans[r].splice(
                0,
                deleteUntil
            );
        }


        // Delete from beginning of destination row
        // to destination position
        let deleteUntil = newCol;

        for (let i = 0; i < newCol; i++) {

            if (
                type !== "$" &&
                punctuations.includes(state.characters[newRow][i])
            ) {
                deleteUntil = i;
                break;
            }

            const span = state.spans[newRow][i];

            if (isChallengeFinished("deletion", span)) {
                needNewChallenge = true;
            }

            span.remove();
        }

        state.characters[newRow].splice(
            0,
            deleteUntil
        );

        state.spans[newRow].splice(
            0,
            deleteUntil
        );
    }


    ensureRowHasSpan(newRow);

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

function joinNextRow(row) {
    if (row + 1 >= state.characters.length) {
        return false;
    }

    const currentSpans = state.spans[row];
    const nextSpans = state.spans[row + 1];

    // Remove the current row's empty end-position span
    const currentEndSpan = currentSpans.at(-1);

    if (currentEndSpan && currentEndSpan.textContent === "") {
        currentEndSpan.remove();
        currentSpans.pop();
    }

    // Remove the <br> separating the two logical rows
    const br = state.brElArr[row];

    if (br) {
        br.remove();
        state.brElArr.splice(row, 1);
    }

    // Move the actual characters into the current row
    state.characters[row].push(...state.characters[row + 1]);

    // Move the actual spans into the current row
    const nextActualSpans = nextSpans.slice(
        0,
        state.characters[row + 1].length
    );

    state.spans[row].push(...nextActualSpans);

    // Remove the old next row's data
    state.characters.splice(row + 1, 1);
    state.spans.splice(row + 1, 1);

    // Create the new end-position span
    const endSpan = document.createElement("span");
    endSpan.textContent = "";

    state.spans[row].push(endSpan);

    // Put it after the last actual character
    const lastSpan = state.spans[row][state.spans[row].length - 2];

    if (lastSpan) {
        lastSpan.after(endSpan);
    } else {
        document.getElementById("terminal-text").appendChild(endSpan);
    }

    return true;
}

// Enters insert mode and jumps to the end of the current line.
export function appendAtEndLine() {
    state.mode = "insert";
    modeEl.textContent = "INSERT";
    state.cursor.col = state.spans[state.cursor.row].length;
    updateCursor();
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!! Works weirdly with punctuations, needs fixing.
// Helper Function used in wCommand and dwCommand
function findNextWordW(inputRow, inputCol) {
    let row = inputRow;
    let col = inputCol;

    while (true) {

        // If we're currently on a word character,
        // skip the rest of the word.
        if (
            col < state.characters[row].length &&
            isWordChar(state.characters[row][col])
        ) {
            while (
                col < state.characters[row].length &&
                isWordChar(state.characters[row][col])
            ) {
                col++;
            }

            // If punctuation immediately follows the word,
            // stop on it.
            if (
                col < state.characters[row].length &&
                state.characters[row][col] !== " "
            ) {
                return { row, col };
            }
        }

        // If we're currently on punctuation, skip the
        // entire punctuation group.
        else if (
            col < state.characters[row].length &&
            state.characters[row][col] !== " "
        ) {
            while (
                col < state.characters[row].length &&
                !isWordChar(state.characters[row][col]) &&
                state.characters[row][col] !== " "
            ) {
                col++;
            }
        }

        // Skip spaces.
        while (
            col < state.characters[row].length &&
            state.characters[row][col] === " "
        ) {
            col++;
        }

        // Found the next word/punctuation.
        if (col < state.characters[row].length) {
            return { row, col };
        }

        // Move to the next logical row.
        if (row >= state.characters.length - 1) {
            return {
                row,
                col: state.characters[row].length - 1
            };
        }

        row++;
        col = 0;

        // Skip indentation.
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

function isWordChar(char) {
    return /[A-Za-z0-9_]/.test(char);
}


export function findNextWordE(row, col) {
    let currentRow = row;
    let currentCol = col;

    const isWordChar = (char) => {
        return char !== " " && !punctuations.includes(char);
    };

    // Already on punctuation
    if (punctuations.includes(state.characters[currentRow][currentCol])) {

        // Last character of the logical row
        if (currentCol === state.characters[currentRow].length - 1) {
            currentRow++;

            if (currentRow >= state.characters.length) {
                return {
                    row: row,
                    col: col
                };
            }

            currentCol = 0;
        }
        else {
            // Move to the next character.
            // This can be another punctuation character.
            currentCol++;
        }
    }

    // Currently inside a word
    else if (isWordChar(state.characters[currentRow][currentCol])) {

        // Move to the end of the current word
        while (
            currentCol + 1 < state.characters[currentRow].length &&
            isWordChar(state.characters[currentRow][currentCol + 1])
        ) {
            currentCol++;
        }

        // If we actually moved within the word,
        // return its last character.
        if (currentCol !== col) {
            return {
                row: currentRow,
                col: currentCol
            };
        }

        // Already at the end of the word.
        currentCol++;

        // If the word was the last thing on the row,
        // search from the next logical row.
        if (currentCol >= state.characters[currentRow].length) {
            currentRow++;

            if (currentRow >= state.characters.length) {
                return {
                    row: row,
                    col: col
                };
            }

            currentCol = 0;
        }
    }

    while (true) {

        // Skip spaces
        while (
            currentCol < state.characters[currentRow].length &&
            state.characters[currentRow][currentCol] === " "
        ) {
            currentCol++;
        }

        // Found something that isn't a space.
        if (currentCol < state.characters[currentRow].length) {

            // If it's punctuation, return that exact character.
            if (punctuations.includes(state.characters[currentRow][currentCol])) {
                return {
                    row: currentRow,
                    col: currentCol
                };
            }

            // Otherwise find the end of the word.
            while (
                currentCol + 1 < state.characters[currentRow].length &&
                isWordChar(state.characters[currentRow][currentCol + 1])
            ) {
                currentCol++;
            }

            return {
                row: currentRow,
                col: currentCol
            };
        }

        // Nothing left on this logical row.
        currentRow++;

        if (currentRow >= state.characters.length) {
            return {
                row: row,
                col: col
            };
        }

        currentCol = 0;
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

// Returns the position of the start of the current line
function findStartOfLine(row, col) {
    let start = 0;

    while (
        start < state.characters[row].length &&
        state.characters[row][start] === " "
    ) {
        start++;
    }

    return { row, col: start };
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

// Need to add when using dw it deletes further up after the current lin ends.
export function motionCommand(func, count) {
    for (let i = 0; i < count; i++) {
        func();
    }
}