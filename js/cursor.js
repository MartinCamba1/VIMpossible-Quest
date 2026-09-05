
import { state } from "./globals.js";
const cursorElement = document.createElement("span");
cursorElement.classList.add("cursor");
const terminal = document.querySelector("#vim-terminal");

export function moveUp() {
    if (state.cursor.row > 0) {
        moveCursor("row", -1);
    }
}

export function moveLeft() {
    if (state.cursor.col > 0) {
        moveCursor("col", -1);
    }
}

export function moveRight() {
    if (state.cursor.col < state.spans[state.cursor.row].length - 1) {
        moveCursor("col", +1);
    }
}

export function moveDown() {
    if (state.cursor.row < state.spans.length - 1) {
        moveCursor("row", +1);
    }
}

export function moveCursor(colOrRow, change) {

    if (colOrRow == "col") {
        state.cursor.col = state.cursor.col + change;

        if (
            state.cursor.col >= state.spans[state.cursor.row].length &&
            state.cursor.row < state.spans.length - 1
        ) {
            state.cursor.row++;
            state.cursor.col = 0;
        }
    }
    else {
        state.cursor.row = state.cursor.row + change;
        
        if (state.spans[state.cursor.row].length > 0 &&
            state.cursor.col >= state.spans[state.cursor.row].length) {
            state.cursor.col = state.spans[state.cursor.row].length - 1;
        }
    }
    updateCursor();

}

export function updateCursor() {
    const row = state.spans[state.cursor.row];

    if (row.length > 0 && state.cursor.col < state.spans[state.cursor.row].length) {
        row[state.cursor.col].before(cursorElement);
    } else {
        state.brElArr[state.cursor.row].before(cursorElement);
    }

    cursorElement.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "nearest"
    });
}

export function isCursorAtEdge() {
    const cursorRect = cursorElement.getBoundingClientRect();
    const terminalRect = terminal.getBoundingClientRect();

    return cursorRect.right >= terminalRect.right;
}