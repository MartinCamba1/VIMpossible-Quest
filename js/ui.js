import { 
    state,
    codeLines,
    resetGlobals
} from "./globals.js";

import {
    roundComplete,
    roundLost
} from "./audio.js";

import { isElemAtEdge } from "./cursor.js";


// Function which comverts the terminal text into spans in the global 'state'.
// Each row has its own array of spans.
// Also creates a 'states.characters' array where each row has all of the characters in it.
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
export function updateTimer() {
    const totalTime = state.remainingTime;
    const timeOfStart = state.timeOfStart;

    const timerEl = document.getElementById("time-left");
    let delta = Math.floor((Date.now() - timeOfStart) / 1000);
    let currTime = totalTime - delta;
    if (currTime <= 0) {
        timerEl.textContent = formatTime(0);
        stopTimer();
    }
    else {
        timerEl.textContent = formatTime(totalTime - delta);
    }
}


//!!!!!!!!!!!!!!!!!!!!!!!!! For some reason when you pause the game and resume the timer goes back to the starting value i dont have enough power to resolve it now.
// Starts the timer when the round starts.
export function resumeTimer() {
    if (!state.timer) {
        const now = Date.now();

        state.paused = false;
        state.timeOfStart = now;

        if (state.pauseStart !== null) {
            state.pausedTime += Math.floor((Date.now() - state.pauseStart) / 1000);
            state.pauseStart = null;
        }

        state.timer = setInterval(
            () => updateTimer(state.timer, state.totalTime),
            1000
        );
    }
}


export function pauseTimer() {
    clearInterval(state.timer);
    state.timer = undefined;

    state.paused = true;
    state.pauseStart = Date.now();
}


// Stops the timer when the round ends. Also displays the dialog based on whether the user lost or not.
// Displays three commands for the user to pick one of them to unlock.
// Lost round seems to play again after a while after losing a round.
export function stopTimer() {
    clearInterval(state.timer);
    state.timer = undefined;
    state.paused = true;

    const dialogEl = document.getElementById("terminal-dialog");
    let pointsScoredSpan;
    let pointsNeededEl;
    
    let pointsNeeded = state.pointsNeeded;
    let pointsScored = state.pointsThisRound;
    
    const startRoundDg = document.getElementById("round-start-dg");
    startRoundDg.style.display = "none";

    if (state.pointsThisRound < state.pointsNeeded) {
        roundLost();
        const roundLostDg = document.getElementById("round-lost-dg");
        roundLostDg.style.display = "flex";

        pointsScoredSpan = document.getElementById("points-scored-lost");
        pointsNeededEl = document.getElementById("points-needed-lost");
        resetGlobals();
    }

    else {
        roundComplete();
        const endRoundDg = document.getElementById("round-end-dg");
        

        pointsScoredSpan = document.getElementById("points-scored");
        pointsNeededEl = document.getElementById("points-needed");

        const btn1 = document.getElementById("command-1");
        const btn2 = document.getElementById("command-2");
        const btn3 = document.getElementById("command-3");

        state.pointsNeeded = Math.round(state.pointsNeeded * 1.25);
        pointsNeeded = state.pointsNeeded;
        
        endRoundDg.style.display = "block";

        const idxs = displayCommands();

        btn1.onclick = () => unlockCommand(idxs, 0);
        btn2.onclick = () => unlockCommand(idxs, 1);
        btn3.onclick = () => unlockCommand(idxs, 2);
    }
    console.log(pointsScored, pointsNeeded);
    pointsScoredSpan.textContent = pointsScored;
    state.pointsThisRound = 0;
    pointsNeededEl.textContent = pointsNeeded;

    dialogEl.showModal();
}




/*----------------------------------*/

/*      Unlocking New Commands      */

// Displays functions available to unlock after the player finishes a round.
export function displayCommands() {
    

    //Make it so when there are less than 3 commands to unlock the div itself doesnt show up or even when there is 0 none show up
    // Or make it so when there are less than 3 to unlock the remaining ones give the player points.
    const commDiv1 = document.getElementById("command-1");
    const commDiv2 = document.getElementById("command-2");
    const commDiv3 = document.getElementById("command-3");

    const commands = [];
    const idxs = [];
    let idx = -1;

    for (let i = 0; i < 3; i++) {
        do {
            idx = Math.floor(Math.random() * state.availableCommands.length);
        } while (idxs.includes(idx))
        commands.push(state.availableCommands[idx]);
        idxs.push(idx);
    }
    commDiv1.textContent = commands[0];
    commDiv2.textContent = commands[1];
    commDiv3.textContent = commands[2];

    return idxs;
}

// Function used to unlock the command the user has chosen.
export function unlockCommand(idxs, i) {
    const newCommand = state.availableCommands[idxs[i]];
    state.commands.get(newCommand).unlocked = true;
    
    for (const type of state.commands.get(newCommand).type) {
        if (!state.unlockedTypes.includes(type)) {
            state.unlockedTypes.push(type);
        }
    }

    const comms = document.querySelectorAll(".command");
    const last = comms[comms.length - 1];

    const newComDiv = document.createElement("div");
    newComDiv.classList.add("command");
    newComDiv.textContent = newCommand;

    state.unlockedCommandsDivs.push(newComDiv);

    last.after(newComDiv);
    
    state.availableCommands.splice(idxs[i], 1);

    const betweenRoundsDiv = document.getElementById("between-round-dg");
    const roundEndDiv = document.getElementById("round-end-dg");

    roundEndDiv.style.display = "none";
    betweenRoundsDiv.style.display = "flex";
}
/*----------------------------------*/

/*      Bottom Controls     */
/*
const volumeOn = document.querySelector(".volume-on");
const volumeOff = document.querySelector(".volume-off");
*/
const pauseButton = document.querySelector(".pause");
const playButton = document.querySelector(".play");

const darkMode = document.querySelector(".dark-mode");
const lightMode = document.querySelector(".light-mode");
/*
volumeOn.addEventListener("click", toggleIcon);
volumeOff.addEventListener("click", toggleIcon);
*/

if (pauseButton && playButton) {
    pauseButton.addEventListener("click", toggleIcon);
    playButton.addEventListener("click", toggleIcon);
}

darkMode.addEventListener("click", toggleIcon);
lightMode.addEventListener("click", toggleIcon);

function toggleIcon(event) {
    const pressedSvg = event.currentTarget;

    /*
    if (pressedSvg === volumeOn) {
        state.soundDisabled = true;

        volumeOn.classList.add("hidden");
        volumeOff.classList.remove("hidden");
    } else if (pressedSvg === volumeOff) {
        state.soundDisabled = false;
        
        volumeOff.classList.add("hidden");
        volumeOn.classList.remove("hidden");
    */
     if (pressedSvg === pauseButton) {
        pauseTimer();

        pauseButton.classList.add("hidden");
        playButton.classList.remove("hidden");
    } else if (pressedSvg === playButton) {
        state.timeOfStart = Date.now();
        resumeTimer();

        playButton.classList.add("hidden");
        pauseButton.classList.remove("hidden");
    }
    else if (pressedSvg === darkMode) {
        darkMode.classList.add("hidden");
        lightMode.classList.remove("hidden");
    } else if (pressedSvg === lightMode) {
        lightMode.classList.add("hidden");
        darkMode.classList.remove("hidden");
    }
}



/*----------------------------------*/