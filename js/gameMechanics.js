import { state } from "./globals.js";

export function moveToCharChallenge() {
    let row = Math.floor(Math.random() * state.characters.length);
    let col = Math.floor(Math.random() * state.characters[row].length)
    let target = state.characters[row][col];
    let span = state.spans[row][col];

    span.classList.add("move-to-char-challenge");
    state.challenge.type = "move-to-char";
    state.challenge.row = row;
    state.challenge.col = col;
}

export function isChallengeFinished() {
    let col = state.cursor.col;
    let row = state.cursor.row;
    if (state.challenge?.type === "move-to-char") {
        if (state.challenge.row === row && state.challenge.col === col) {
            state.spans[state.challenge.row][state.challenge.col].classList.remove("move-to-char-challenge");
            return true;
        }
    }
    return false;
}