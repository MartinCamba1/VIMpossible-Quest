import { state } from "./globals.js";

let availableCommands = ["x", "dd", "i", "A", "w", "dw", "b"];
import {commands} from "./index.js";

export function spanify(text) {
    const terminal = document.getElementById("vim-terminal");

    const terminalText = document.getElementById("terminal-text");

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



export function formatTime(time) {
    let seconds = time % 60;
    let minutes = Math.floor(time / 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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

export function startTimer(timer, totalTime, timeOfStart) {
    if (!timer) {
        timer = setInterval(() => updateTimer(timer, totalTime, timeOfStart), 1000);
    }
}

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