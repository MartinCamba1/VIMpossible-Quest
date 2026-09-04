
/*.   Constants and variables     */

import { state } from "./globals.js";

import {
    moveLeft,
    moveDown,
    moveUp,
    moveRight,
    updateCursor
} from "./cursor.js";

import {
    deleteChar,
    deleteLine,
    appendAtEndLine,
    wCommand,
    dwCommand,
    bCommand
} from "./commands.js";

let inputBuffer = [];
let unlockedCommands = ["h", "j", "k", "l"];




const terminalWindow = document.getElementById("vim-terminal");

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



const texts = [
    "The quick brown fox jumps over the lazy dog.",
    "JavaScript allows you, to manipulate elements on a web page.",
    "Learning Vim requires repetition and practice.",
    "Functions allow you to organize reusable pieces of codeeeeeeeeeeeeeeeeeeeeee."
];

/*----------------------------------*/


/*      Functions       */

function spanify(text) {
    state.characters.length = 0;
    state.brElArr.length = 0;
    terminalText.innerHTML = "";

    const res = [];
    let rowSpans = [];
    let rowChars = [];

    for (const line of text) {
        rowSpans = [];
        rowChars = [];
        for (const char of line) {
            rowChars.push(char);
            const span = document.createElement("span");
            span.textContent = char;
            rowSpans.push(span);

            
            terminalText.appendChild(span);
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
        
        console.log(state.spans)

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
    else {
        state.spans[state.cursor.row].splice(state.cursor.col, 0, span);
        state.characters[state.cursor.row].splice(state.cursor.col, 0, event.key);

        if (state.spans[state.cursor.row][state.cursor.col + 1]) {
            state.spans[state.cursor.row][state.cursor.col + 1].before(span);
        } else {
            state.brElArr[state.cursor.row].before(span);
        }

        state.cursor.col++;
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
}


function startRound() {
    dialogEl.close();

    state.cursor.col = 0;
    state.cursor.row = 0;

    /*const randomText = texts[Math.floor(Math.random() * texts.length)];*/
    let randomText = texts;

    state.spans = spanify(randomText);
    updateCursor();
}


/*----------------------------------*/


/*      Executable code     */


startGameBtn.addEventListener("click", () => startRound());
document.addEventListener("keydown", (event) => handleKeyPress(event));

/*setInterval(blinkingCursor, 500);*/

/*----------------------------------*/