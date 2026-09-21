import { 
    state,
    codeLines
} from "./globals.js";

let availableCommands = ["x", "dd", "i", "A", "w", "dw", "b"];
import {commands} from "./index.js";
import { isElemAtEdge } from "./cursor.js";


// Function which comverts the terminal text into spans in the global 'state'.
// Each row has its own array of spans.
// Also creates a 'states.characters' array where each row has all of the characters in it.

// Need to fix creating the text the way it checks if it reached the edges doesnt work.
export function spanify() {
    const terminal = document.getElementById("vim-terminal");

    const terminalText = document.getElementById("terminal-text");

    state.characters.length = 0;
    state.brElArr.length = 0;
    terminalText.innerHTML = "";

    const lineHeight = parseFloat(
        getComputedStyle(terminalText).lineHeight
    );

    const terminalRect = terminal.getBoundingClientRect();
    const horizontalEdge = terminalRect.right;
    const verticalEdge = terminalRect.bottom - lineHeight;
    

    const res = [];
    let rowSpans = [];
    let rowChars = [];

    while (true) {
        rowSpans = [];
        rowChars = [];

        const line = getRandomLine();
        for (const char of line) {
            const span = document.createElement("span");
            span.textContent = char;
            terminalText.appendChild(span);
            let spanRect = span.getBoundingClientRect();
            
            if (spanRect.bottom > verticalEdge) {
                span.remove();
                for (const delSpan of rowSpans) {
                    delSpan.remove();
                }
                return res;
            }

            if (spanRect.right > horizontalEdge) {
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

// Return a random line from the codeLines array
function getRandomLine() {
    return codeLines[Math.floor(Math.random() * codeLines.length)];
}
// Handles when the user deletes a blank line but doesnt work sometimes, needs debugging.
export function handleDeletionLineBreak() {
    let idx = 0;
    const row = state.cursor.row;
    const newCol = state.spans[row - 1].length;

    let prevRowLen = state.characters[row - 1].length;
    let currRowLen = state.characters[row].length;

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


/*      Time Formatting     */

// Converts input time into text, which can be shown to the player.
export function formatTime(time) {
    let seconds = time % 60;
    let minutes = Math.floor(time / 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Updates the time remaining in the current round each second.
export function updateTimer(timer, totalTime, timeOfStart) {
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

// Starts the timer when the round starts.
export function startTimer(timer, totalTime, timeOfStart) {
    if (!timer) {
        timer = setInterval(() => updateTimer(timer, totalTime, timeOfStart), 1000);
    }
}

// Stops the timer when the round ends. Also displays the dialog based on whether the user lost or not.
// Displays three commands for the user to pick one of them to unlock.
export function stopTimer(timer) {
    clearInterval(timer);
    timer = undefined;
    /*updateRoundCounter();*/

    const dialogEl = document.getElementById("terminal-dialog");
    let pointsScoredSpan;
    let pointsNeeded;
    const startRoundDg = document.getElementById("round-start-dg");
    startRoundDg.style.display = "none";

    if (state.pointsThisRound < state.pointsNeeded) {
        const roundLostDg = document.getElementById("round-lost-dg");
        roundLostDg.style.display = "flex";

        pointsScoredSpan = document.getElementById("points-scored-lost");
        pointsNeeded = document.getElementById("points-needed-lost");
    }

    else {
        const endRoundDg = document.getElementById("round-end-dg");
        

        pointsScoredSpan = document.getElementById("points-scored");
        pointsNeeded = document.getElementById("points-needed");

        const btn1 = document.getElementById("command-1");
        const btn2 = document.getElementById("command-2");
        const btn3 = document.getElementById("command-3");

        state.pointsNeeded = Math.round(state.pointsNeeded * 1.25);
        
        endRoundDg.style.display = "block";

        const idxs = displayCommands(availableCommands);

        btn1.onclick = () => unlockCommand(idxs, 0, availableCommands, commands);
        btn2.onclick = () => unlockCommand(idxs, 1, availableCommands, commands);
        btn3.onclick = () => unlockCommand(idxs, 2, availableCommands, commands);
    }

    pointsScoredSpan.textContent = state.pointsThisRound;
    state.pointsThisRound = 0;
    pointsNeeded.textContent = state.pointsNeeded;

    dialogEl.showModal();
    
}

/*----------------------------------*/

/*      Unlocking New Commands      */

// Displays functions available to unlock after the player finishes a round.
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

// Function used to unlock the command the user has chosen.
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
/*----------------------------------*/