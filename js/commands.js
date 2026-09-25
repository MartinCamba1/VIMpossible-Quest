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
    if (isChallengeFinished(["single-char-deletion"], span)) {
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
    const pos = findNextWord(state.cursor.row, state.cursor.col);
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

// Deletes the next word ahead of the cursor.

/* Need to add not deleting whitespace such as . after the word */
/* Doesnt delete the first character of the word for some reason. */
    // Need to test it properly on a single punctuation mark.
export function dwCommand() {
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


    const pos = findNextWord(state.cursor.row, state.cursor.col);
    const newRow = pos.row;
    let newCol = pos.col;

    if (newRow === row && newCol === col) {
        newCol++;
    }

    if (state.cursor.row !== newRow) {
        /* Add deleting backwards with function findPrevWord() */
        newCol = state.characters[state.cursor.row].length;
    }
    state.characters[state.cursor.row].splice(state.cursor.col, (newCol - state.cursor.col));
    
    for (let i = state.cursor.col; i < newCol; i++) {
        if (isChallengeFinished("deletion", state.spans[state.cursor.row][i])) {
            needNewChallenge = true;
        }
        state.spans[state.cursor.row][i].remove();
        
    }
    state.spans[state.cursor.row].splice(state.cursor.col, (newCol - state.cursor.col));

    if (needNewChallenge === true) {
        pickNewChallenge();
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