import { state } from "./globals.js";

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