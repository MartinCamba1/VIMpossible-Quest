
/*.   Constants and variables     */

import { state } from "./globals.js";

import {
    moveLeft,
    moveDown,
    moveUp,
    moveRight,
    updateCursor,
    isElemAtEdge
} from "./cursor.js";

import {
    deleteChar,
    deleteLine,
    appendAtEndLine,
    wCommand,
    dwCommand,
    bCommand,
    ggCommand,
    GCommand
} from "./commands.js";

import {
    isChallengeFinished,
    pickNewChallenge,
    updateObjectiveText,

    moveToCharChallenge,
    deleteWordChallenge,
} from "./gameMechanics.js";

import {
    pointsAudio,
    clickAudio
} from "./audio.js";

import {
    resumeTimer,
    pauseTimer,
    spanify,
    handleDeletionLineBreak,

    displayCommands,
    unlockCommand
} from "./ui.js";

let inputBuffer = [];

const dialogEl = document.getElementById("terminal-dialog");
const startGameBtns = document.querySelectorAll(".start-round-btn");


const modeEl = document.getElementById("mode-text");

/*
const texts = [
    "The quick brown fox jumps over the lazy dog.",
    "JavaScript allows you, to manipulate elements on a web page.",
    "Learning Vim requires repetition and practice.",
    "Functions allow you to organize reusable pieces of codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee."
];
*/
/*----------------------------------*/


/*      Functions       */


/*      Input Parsing       */
//Checks whether a string in inputBuffer can lead to an existing command
function isPossibleCommand(input) {
    for(const command of state.commands.keys()) {
        if (command.startsWith(input)) return true;
    }
    return false;
}

// Handles key updating in the bottom of the terminal and clears inputBuffer when the input no longer makes sense.
// Calls a function for existing command
function parseInput(event) {
    const inputBufferDiv = document.getElementById("input-buffer");
    const inputBufferText = document.getElementById("buffer-text");
    inputBuffer.push(event.key);

    let input = inputBuffer.join("");

    if (state.commands.get(input) && state.commands.get(input).unlocked === true) {
        inputBufferDiv.style.display = "none";
        inputBufferText.textContent = "";
        inputBuffer.length = 0;
        return state.commands.get(input).action;

    }
    else if (isPossibleCommand(input)) {
        inputBufferDiv.style.display = "flex";
        inputBufferText.textContent = input;
        return null;
    }
    inputBufferDiv.style.display = "none";
    inputBufferText.textContent = "";
    inputBuffer.length = 0;
    return null;
}

// Function that handles each key press and decides on whether to look for a command or insert the text.
function handleKeyPress(event) {
    if (state.paused === true) {
        return;
    }

    if (event.key === "ArrowLeft") {
        moveLeft();
        updateCursor();
    }

    else if (event.key === "ArrowUp") {
        moveUp();
        updateCursor();
    }
    
    else if (event.key === "ArrowRight") {
        moveRight();
        updateCursor();
    }

    else if (event.key === "ArrowDown") {
        moveDown();
        updateCursor();
    }

    else if (state.mode === "normal") {
        const func = parseInput(event);
        if (func !== null) {
            func();
        }
    }
    else {
        if (event.key === "Escape") {
            exitInsertMode();
        }
        else {
            handleInsertMode(event);
        }
    }

    if (
        state.mode === "normal" &&
        state.unlockedCommands.includes(event.key) &&
        state.commands.has(event.key)
    ) {
        const type = state.commands.get(event.key).type;

        if (isChallengeFinished(
            type,
            state.spans[state.cursor.row][state.cursor.col]
        )) {
            pickNewChallenge();
        }
    }
}




/*----------------------------------*/



/*      Handling Insert Mode        */

// Function which enters the INSERT mode.
export function insertCommand() {
    state.mode = "insert";
    modeEl.textContent = "INSERT";
}

// Function which exits the INSERT mode.
export function exitInsertMode() {
    if (state.cursor.col > 0) state.cursor.col--;
    updateCursor();
    state.mode = "normal";
    modeEl.textContent = "NORMAL";
}

// Function which handles parsing the text and other inputs such as Enter.
// !!!!!!!!!!!!!!!!!!!!!! Want to move this to the gameMechanics section but will be a pain in the ass.
export function handleInsertMode(event) {
    const span = document.createElement("span");
    span.textContent = event.key;

    const row = state.cursor.row;
    const col = state.cursor.col;

    if (event.key === "Enter") {
        const text = state.characters[row];
        const lineStart = text.slice(0, col);
        const lineEnd = text.slice(col);

        state.characters[row] = lineStart;
        state.characters.splice(row + 1, 0, lineEnd);

        const newLineSpans = [];
        
        for (let i = 0; i < lineEnd.length; i++) {
            const span = state.spans[row].pop();
            span.remove();
        }
        

        for (const char of lineEnd) {
            const newSpan = document.createElement("span");
            newSpan.textContent = char;
            newLineSpans.push(newSpan);
        }

        state.spans.splice(row + 1, 0, newLineSpans);

        let brEl = document.createElement("br");
        state.brElArr.splice(row, 0, brEl);

        const currentBr = state.brElArr[row + 1];

        if (currentBr) {
            currentBr.before(brEl);
        } else {
            state.brElArr[row].before(brEl);
        }

        for (const span of newLineSpans) {
            brEl.after(span);
            brEl = span;
        }

        state.cursor.row++;
        state.cursor.col = 0;
    }
    /*      Need to fix this part when trying to delete a blank line and also update the use of br elements after deleting a line       */
    else if ((event.key === "Backspace" || event.key === "Delete") &&
            (state.characters[row].length >= 0) && ((col != 0) || (row != 0) )) {
        if (col === 0) {
            const newCol = handleDeletionLineBreak();

            state.cursor.col = newCol;
            state.cursor.row = Math.max(0, row - 1);
            
        }
        else {
            state.characters[row].splice(col - 1, 1);
            state.spans[row][col - 1].remove();
            state.spans[row].splice(col - 1, 1);
            state.cursor.col--;
        }
    }
    else {
        if (event.key.length === 1) {
            if (state.challenge.type === "write-word" && state.challenge.targets.includes(state.spans[row][col])) {
                if (isChallengeFinished(["insertion"], state.spans[row][col])) {
                    pickNewChallenge();
                };
            }
            else {
                state.spans[state.cursor.row].splice(state.cursor.col, 0, span);
                state.characters[state.cursor.row].splice(state.cursor.col, 0, event.key);

                if (state.spans[state.cursor.row][state.cursor.col + 1]) {
                    state.spans[state.cursor.row][state.cursor.col + 1].before(span);
                } else {
                    state.brElArr[state.cursor.row].before(span);
                }
            }
            state.cursor.col++;
        }
    }
    updateCursor();
}

/*----------------------------------*/

/*      Starting A Round        */

// Resets the timer and points, picks a challenge, starts a new round
function startRound() {
    const betweenRoundsDiv = document.getElementById("between-round-dg");
    const roundLostDg = document.getElementById("round-lost-dg");
    betweenRoundsDiv.style.display = "none";
    roundLostDg.style.display = "none";
    dialogEl.close();

    state.cursor.col = 0;
    state.cursor.row = 0;
    state.paused = false;

    
    state.remainingTime = 20;
    state.timeOfStart = Date.now();
    state.timer = undefined;
    resumeTimer();

    const pointsNeededEl = document.getElementById("points-num");
    pointsNeededEl.classList.remove("round-complete");
    pointsNeededEl.textContent = "Points Left: " + state.pointsNeeded.toString();
    
    state.spans = spanify();
    updateCursor();
    pickNewChallenge();
}


/*----------------------------------*/


/*      Executable code     */

dialogEl.showModal();
startGameBtns.forEach((btn) => btn.addEventListener("click", () => startRound()));
document.addEventListener("keydown", (event) => handleKeyPress(event));

const allBtns = document.querySelectorAll(".button");

for (let btn of allBtns) {
    btn.addEventListener("click", () => clickAudio());
}

/*----------------------------------*/