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
    let target = state.spans[row][col];

    target.classList.add("move-to-char-challenge");
    state.challenge.type = "move-to-char";
    state.challenge.target = target;
}

export function deleteWordChallenge() {
    const targets = findRandWord();
    if (targets == undefined) {
        return undefined;
    }

    targets.forEach((target) => {
        target.classList.add("delete-word-challenge");
    })

    state.challenge.type = "delete-word";
    state.challenge.targets = targets;
}

function findRandWord() {
    let row = Math.floor(Math.random() * state.characters.length);
    let col = Math.floor(Math.random() * state.characters[row].length)

    let i = 0;
    while (col - i >= 0 && col + i < state.characters[row].length && 
        (state.characters[row][col + i] == " " && state.characters[row][col - i] == " ")) {
            i++;
        }
    
    if (state.characters[row][col - i] == " " && state.characters[row][col + i] == " ") return undefined;
    if (state.characters[row][col - i] != " ") {
        col -=i;
    }
    else {
        col += i;
    }

    return findEdgeOfWord(row, col);
}

function findEdgeOfWord(row, col) {
    const res = [state.spans[row][col]];

    let aux = 1;

    while (col - aux >= 0 && state.characters[row][col - aux] != " ") {
        res.push(state.spans[row][col - aux]);
        aux++;
    }

    aux = 1;

    while (col + aux < state.characters[row].length && state.characters[row][col + aux] != " ") {
        res.push(state.spans[row][col + aux]);
        aux++;
    }

    return res;
}

export function isChallengeFinished(typeOfAction) {
    let col = state.cursor.col;
    let row = state.cursor.row;
    console.log(typeOfAction);
    if (typeOfAction === "movement") {
        if (state.challenge?.type === "move-to-char") {
            const cursorEl = state.spans[row][col];
            if (cursorEl === state.challenge.target) {
                state.challenge.target.classList.remove("move-to-char-challenge");
                state.challenge = {};
                givePoints(state.challengeStartTime);
                return true;
            }
        }
    }
    
    //Need to add a way to verify when using dw because now it is on a basis of one span per command which doesnt work.
    //Also using x to clear this challenge doesnt work either.
    else if (typeOfAction === "deletion") {
        if (state.challenge.type === "delete-word") {
            const cursorEl = state.spans[row][col];
            if (state.challenge.targets.includes(cursorEl)) {
                cursorEl.classList.remove("delete-word-challenge");
                state.challenge.targets.splice(state.challenge.targets.findIndex((el) => el === cursorEl), 1);
            }

            if (state.challenge.targets.length === 0) {
                state.challenge = {};
                givePoints(state.challengeStartTime);
                return true;
            }
        }
        return false;
    }
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
    const commandTypes = new Map([
        ["h", "movement"],
        ["j", "movement"],
        ["k", "movement"],
        ["l", "movement"],

        ["x", "deletion"],
        ["dd", "deletion"],
        ["dw", "deletion"],

        ["i", "inserting"],
        ["A", "inserting"],

        ["w", "movement"],
        ["b", "movement"]
    ]);

    const newCommand = availableCommands[idxs[i]];
    cmnds.get(newCommand).unlocked = true;
    

    if (!state.unlockedTypes.includes(commandTypes.get(newCommand))) {
        state.unlockedTypes.push(commandTypes.get(newCommand));
    }

    const commands = document.querySelectorAll(".command");
    const last = commands[commands.length - 1];

    const newComDiv = document.createElement("div");
    newComDiv.classList.add("command");
    newComDiv.textContent = newCommand;

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