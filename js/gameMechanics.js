import { state } from "./globals.js";
import {
    pointsAudio
} from "./audio.js";

/*      Need to add a way to resolve the issue when the word is deleted     */
/*      Also there is an issue when the user deletes a line or the word shifts a position so better would be to check for the span right away   */
/*      Bug where if you delete some part of the line where the challenge is active it doesnt register the change in positioning in globals.js. */
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
            givePoints(state.challengeStartTime);
            return true;
        }
    }
    return false;
}

export function givePoints(startTime) {
    const pointsEl = document.getElementById("points-num");
    let delta = Math.floor((Date.now() - startTime) / 1000);
    state.pointsThisRound = state.pointsThisRound + Math.round(50 + 350 * Math.exp(-0.3 * delta));

    const pointsLeft = state.pointsNeeded - state.pointsThisRound;
    if (pointsLeft > 0) {
        pointsEl.textContent =  "Points Left: " + (pointsLeft).toString();

        pointsEl.classList.remove("points-scored");

        void pointsEl.offsetWidth;

        pointsEl.classList.add("points-scored");
    }
    else {
        pointsEl.textContent = "ROUND COMPLETED!";
        pointsEl.style.color = "#90EE90";
    }
    
    pointsAudio();
}

export function displayCommands(availableCommands) {
    //Make it so when there are less than 3 commands to unlock the div itself doesnt show up or even when there is 0 none show up
    const commDiv1 = document.getElementById("command-1");
    const commDiv2 = document.getElementById("command-2");
    const commDiv3 = document.getElementById("command-3");

    const commands = [];
    const idxs = [];
    let idx = -1;

    for (let i = 0; i < 3; i++) {
        do {
            idx = Math.floor(Math.random() * availableCommands.length);
        } while (idxs.includes(idx))
        commands.push(availableCommands[idx]);
        idxs.push(idx);
    }
    commDiv1.textContent = commands[0];
    commDiv2.textContent = commands[1];
    commDiv3.textContent = commands[2];

    return idxs;
}

export function unlockCommand(idxs, i, availableCommands, cmnds) {
    cmnds.get(availableCommands[idxs[i]]).unlocked = true;

    const commands = document.querySelectorAll(".command");
    const last = commands[commands.length - 1];

    const newComDiv = document.createElement("div");
    newComDiv.classList.add("command");
    newComDiv.textContent = availableCommands[idxs[i]];

    last.after(newComDiv);
    
    availableCommands.splice(idxs[i], 1);

    const betweenRoundsDiv = document.getElementById("between-round-dg");
    const roundEndDiv = document.getElementById("round-end-dg");

    roundEndDiv.style.display = "none";
    betweenRoundsDiv.style.display = "flex";
}

export function updateRoundCounter() {
    const roundNumCounter = document.getElementById("round-num-data");

    const curr = Number(roundNumCounter.textContent);
    roundNumCounter.textContent = curr + 1;
}