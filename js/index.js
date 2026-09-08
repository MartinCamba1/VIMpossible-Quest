
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
    bCommand
} from "./commands.js";

import {
    isChallengeFinished,
    moveToCharChallenge
} from "./gameMechanics.js";

let inputBuffer = [];
let unlockedCommands = ["h", "j", "k", "l"];




const terminal = document.getElementById("vim-terminal");

const terminalText = document.getElementById("terminal-text");

const dialogEl = document.getElementById("terminal-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogMessage = document.getElementById("dialog-message");
const dialogStats = document.getElementById("dialog-stats");
const startGameBtn = document.getElementById("start-round-btn");


const modeEl = document.getElementById("mode-text");


const commands = new Map([
    ["h", moveLeft],
    ["j", moveDown],
    ["k", moveUp],
    ["l", moveRight],
    ["x", deleteChar],
    ["dd", deleteLine],
    ["i", insertCommand],
    ["A", appendAtEndLine],
    ["w", wCommand],
    ["dw", dwCommand],
    ["b", bCommand]
]);

const challenges = [
    moveToCharChallenge
];



const texts = [
    "The quick brown fox jumps over the lazy dog.",
    "JavaScript allows you, to manipulate elements on a web page.",
    "Learning Vim requires repetition and practice.",
    "Functions allow you to organize reusable pieces of codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee."
];

/*----------------------------------*/


/*      Functions       */

function spanify(text) {
    state.characters.length = 0;
    state.brElArr.length = 0;
    terminalText.innerHTML = "";

    const terminalRect = terminal.getBoundingClientRect();

    const res = [];
    let rowSpans = [];
    let rowChars = [];

    for (const line of text) {
        rowSpans = [];
        rowChars = [];
        for (const char of line) {
            const span = document.createElement("span");
            span.textContent = char;
            terminalText.appendChild(span);
            let spanRect = span.getBoundingClientRect();
            
            if (spanRect.right >= terminalRect.right) {
                span.remove();
                state.characters.push(rowChars);
                res.push(rowSpans);
                const brEl = document.createElement("br");
                state.brElArr.push(brEl);
                terminalText.appendChild(brEl);
                terminalText.appendChild(span);

                rowSpans = [];
                rowChars = [];

            }
            rowChars.push(char);
            rowSpans.push(span);
        }

        state.characters.push(rowChars);
        res.push(rowSpans);
        const brEl = document.createElement("br");
        state.brElArr.push(brEl);
        terminalText.appendChild(brEl);
    }

    return res;
    
}

function isPossibleCommand(input) {
    for(const command of commands.keys()) {
        if (command.startsWith(input)) return true;
    }
    return false;
}

function parseInput(event) {
    inputBuffer.push(event.key);

    let input = inputBuffer.join("");
    if (commands.get(input)) {
        inputBuffer.length = 0;
        return commands.get(input);
    }
    else if (isPossibleCommand(input)) {
        return null;
    }
    inputBuffer.length = 0;
    return null;
}

function handleDeletionLineBreak() {
    let idx = 0;
    const row = state.cursor.row;
    const newCol = state.spans[row - 1].length;

    let prevRowLen = state.characters[row - 1].length;
    let currRowLen = state.characters[row].length;
    console.log(currRowLen);
    if (currRowLen === 0) {
        state.brElArr[row].remove();
        state.brElArr.splice(row, 1);
        return newCol;
    }

    let prevLastEl = state.spans[row - 1][prevRowLen - 1];
    while (!isElemAtEdge(prevLastEl) && idx < currRowLen) {
        prevLastEl = state.spans[row - 1][prevRowLen + idx - 1];
        let currEl = state.spans[row][idx];
        currEl.remove();

        if (prevRowLen === 0) {
            state.brElArr[row - 1].after(state.spans[row][idx]);
        }
        else {
            state.spans[row - 1][state.spans[row - 1].length - 1].after(currEl);
        }
        state.spans[row - 1].push(currEl);
        idx++;
    }
    state.characters[row - 1].splice(prevRowLen, 0, ...state.characters[row].splice(0, idx));
    state.spans[row].splice(0, idx);

    return newCol;
}


function insertCommand() {
    state.mode = "insert";
    modeEl.textContent = "INSERT";
}

function exitInsertMode() {
    if (state.cursor.col > 0) state.cursor.col--;
    updateCursor();
    state.mode = "normal";
    modeEl.textContent = "NORMAL";
}

function handleInsertMode(event) {
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
            state.spans[state.cursor.row].splice(state.cursor.col, 0, span);
            state.characters[state.cursor.row].splice(state.cursor.col, 0, event.key);

            if (state.spans[state.cursor.row][state.cursor.col + 1]) {
                state.spans[state.cursor.row][state.cursor.col + 1].before(span);
            } else {
                state.brElArr[state.cursor.row].before(span);
            }

            state.cursor.col++;
        }
    }
    updateCursor();

}

function handleKeyPress(event) {
    if (state.mode === "normal") {
        const func = parseInput(event);
        if (func !== null) func();
    }
    else {
        if (event.key === "Escape") {
            exitInsertMode();
        }
        else {
            handleInsertMode(event);
        }
    }
    if (isChallengeFinished()) {
        pickNewChallenge();
    }
}


function formatTime(time) {
    let seconds = time % 60;
    let minutes = Math.floor(time / 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function updateTimer(timer, totalTime, timeOfStart) {
    const timerEl = document.getElementById("time-left");
    let delta = Math.floor((Date.now() - timeOfStart) / 1000);
    let currTime = totalTime - delta;
    if (currTime <= 0) {
        timerEl.textContent = formatTime(0);
        stopTimer(timer);
    }
    else {
        timerEl.textContent = formatTime(totalTime - delta);
    }
}

function startTimer(timer, totalTime, timeOfStart) {
    if (!timer) {
        timer = setInterval(() => updateTimer(timer, totalTime, timeOfStart), 1000);
    }
}

function stopTimer(timer) {
    clearInterval(timer);
    timer = undefined;
}

function pickNewChallenge() {
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    challenge();
}


function startRound() {
    dialogEl.close();

    state.cursor.col = 0;
    state.cursor.row = 0;

    
    let totalTime = 60;
    let timeOfStart = Date.now();
    let timer;
    startTimer(timer, totalTime, timeOfStart);
    
    

    /*const randomText = texts[Math.floor(Math.random() * texts.length)];*/
    let randomText = texts;

    state.spans = spanify(randomText);
    updateCursor();
    pickNewChallenge();
}


/*----------------------------------*/


/*      Executable code     */


startGameBtn.addEventListener("click", () => startRound());
document.addEventListener("keydown", (event) => handleKeyPress(event));

/*setInterval(blinkingCursor, 500);*/

/*----------------------------------*/