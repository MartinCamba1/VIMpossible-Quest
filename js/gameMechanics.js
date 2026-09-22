import { state } from "./globals.js";
import {
    pointsAudio
} from "./audio.js";


/*      Challenges      */

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

//Used in deleteWordChallenge to pick a random word to make the target
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

// Used in findRandWord to find the edge spans of the random word
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

/*----------------------------------*/

/*      Challenge Completion Handling       */

//Checks if a challenge that is currently active is completed and gives points and picks a new challenge
export function isChallengeFinished(typeOfAction, span) {
    let col = state.cursor.col;
    let row = state.cursor.row;

    if (typeOfAction === "movement") {
        if (state.challenge?.type === "move-to-char") {
            if (span === state.challenge.target) {
                state.challenge.target.classList.remove("move-to-char-challenge");
                state.challenge = {};
                givePoints(state.challengeStartTime);
                return true;
            }
        }
    }
    
    //There is a known bug where the spans when you complete deletion challenge and a new deletion is picked the spans are weird somehow.
    else if (typeOfAction === "deletion") {
        if (state.challenge.type === "delete-word") {
            if (state.challenge.targets.includes(span)) {
                span.classList.remove("delete-word-challenge");
                state.challenge.targets.splice(state.challenge.targets.findIndex((el) => el === span), 1);
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

// Function used to pick a new challenge when the previous one is completed
export function pickNewChallenge() {
    const type = state.unlockedTypes[Math.floor(Math.random() * state.unlockedTypes.length)];
    const typesOfChallenges = new Map([
        ["movement", [
            moveToCharChallenge,
        ]],

        ["deletion", [
            deleteWordChallenge
        ]]
    ]);

    const i = Math.floor(Math.random() * typesOfChallenges.get(type).length);
    const challenge = typesOfChallenges.get(type)[i];
    state.challengeStartTime = Date.now();
    updateObjectiveText(challenge);
    challenge();
}

// Function to give points when a challenge is completed
export function givePoints(startTime) {
    const pointsEl = document.getElementById("points-num");
    let delta = Math.floor((Date.now() - startTime) / 1000);
    state.pointsThisRound = state.pointsThisRound + Math.round(50 + 350 * Math.exp(-0.3 * delta));
    console.log(state.pointsThisRound, state.pointsNeeded);

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

/*----------------------------------*/


/*      Not used currently      */

export function updateRoundCounter() {
    const roundNumCounter = document.getElementById("round-num-data");

    const curr = Number(roundNumCounter.textContent);
    roundNumCounter.textContent = curr + 1;
}

export function updateObjectiveText(challenge) {
    const challengeObjectives = new Map([
        [moveToCharChallenge, "Reach target"],
        [deleteWordChallenge, "Delete word"]
    ]);

    const objectiveSpan = document.getElementById("objective-data");
    objectiveSpan.textContent = challengeObjectives.get(challenge);
}

/*----------------------------------*/