
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
    GCommand,
    motionCommand
} from "./commands.js";

import {
    isChallengeFinished,
    pickNewChallenge,
    checkRowOverflow,
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

    for (const command of state.commands.keys()) {
        if (command.startsWith(input)) return true;
    }

    if (state.commands.get("Motion").unlocked == true) {

        const temp = tryParseMotion(input);

        if (
            //temp.operator == "d" &&
            temp.count > 0 &&
            temp.motion == ""
        ) {
            return true;
        }
    }
    return false;
}

// Handles key updating in the bottom of the terminal and clears inputBuffer when the input no longer makes sense.
// Calls a function for existing command
function parseInput(event) {
    const inputBufferDiv = document.getElementById("input-buffer");
    const inputBufferText = document.getElementById("buffer-text");
    if (event.key.length !== 1) return null;
    
    inputBuffer.push(event.key);

    let input = inputBuffer.join("");

    

    if (state.commands.get(input) && state.commands.get(input).unlocked === true) {
        console.log(state.commands);
        inputBufferDiv.style.display = "none";
        inputBufferText.textContent = "";
        inputBuffer.length = 0;
        return state.commands.get(input).action;

    }

    if (state.commands.get("Motion").unlocked == true) {
        const temp = tryParseMotion(input);
        let operator = temp.operator;
        let count = temp.count;
        let motion = temp.motion;

        operator += motion;
        const func = state.commands.get(operator);
        console.log(func);

        if (func !== undefined && count > 1 && motion != "" && func.unlocked === true) {
            motionCommand(func.action, count);
            inputBufferDiv.style.display = "none";
            inputBufferText.textContent = "";
            inputBuffer.length = 0;
            return null;
        }
    }
    
    if (isPossibleCommand(input)) {
        inputBufferDiv.style.display = "flex";
        inputBufferText.textContent = input;
        return null;
    }
    else {
        inputBufferDiv.style.display = "none";
        inputBufferText.textContent = "";
        inputBuffer.length = 0;
    }
    return null;
}

function tryParseMotion(input) {
    let operator = "";
    let count = 0;
    let countStr = "";
    let motion = "";

    let i = 0;

    while (i < input.length && isAlpha(input[i])) {
        operator += input[i];
        i += 1
    }

    while (i < input.length && isNumber(input[i])) {
        countStr += input[i];
        i += 1
    }

    count = Number(countStr);

    while (i < input.length) {
        motion += input[i];
        i += 1;
    }

    console.log(operator, count, motion);
    return {operator, count, motion};
}

function isAlpha(ch) {
    return /^[A-Z]$/i.test(ch);
}

function isNumber(char) {
    return char >= "0" && char <= "9";
}

// Function that handles each key press and decides on whether to look for a command or insert the text.
function handleKeyPress(event) {
    if (state.paused === true) {
        return;
    }

    if (event.key === "ArrowLeft") {
        moveLeft();
        updateCursor();
        if (isChallengeFinished(["movement"], state.spans[state.cursor.row][state.cursor.col])) {
            pickNewChallenge();
        }
    }

    else if (event.key === "ArrowUp") {
        moveUp();
        updateCursor();
        if (isChallengeFinished(["movement"], state.spans[state.cursor.row][state.cursor.col])) {
            pickNewChallenge();
        }
    }
    
    else if (event.key === "ArrowRight") {
        moveRight();
        updateCursor();
        if (isChallengeFinished(["movement"], state.spans[state.cursor.row][state.cursor.col])) {
            pickNewChallenge();
        }
    }

    else if (event.key === "ArrowDown") {
        moveDown();
        updateCursor();
        if (isChallengeFinished(["movement"], state.spans[state.cursor.row][state.cursor.col])) {
            pickNewChallenge();
        }
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
}

/*----------------------------------*/



/*      Handling Insert Mode        */

// Function which enters the INSERT mode.
export function insertCommand() {
    state.mode = "insert";
    modeEl.textContent = "INSERT";

    const blankSpan = document.createElement("span");
    state.spans[state.cursor.row][state.characters[state.cursor.row].length - 1].after(blankSpan);
    state.spans[state.cursor.row].push(blankSpan);
    state.blankInsertSpans.push(blankSpan);
}

// Function which exits the INSERT mode.
export function exitInsertMode() {
    if (state.cursor.col > 0) state.cursor.col--;
    updateCursor();
    state.mode = "normal";
    modeEl.textContent = "NORMAL";

    for (const span of state.blankInsertSpans) {
        span.remove();
    }
    state.blankInsertSpans.length = 0;
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

        const blankSpan = document.createElement("span");
        state.spans[state.cursor.row][state.characters[row] - 1].after(blankSpan);
        state.blankInsertSpans.push(blankSpan);
    }
    /*      Need to fix this part when trying to delete a blank line and also update the use of br elements after deleting a line       */
    /*      Need to add a check whether a delete char or delete word was completed using this.      */
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
                checkRowOverflow(span);
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

    state.mode = "normal";
    modeEl.textContent = "NORMAL";
    
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