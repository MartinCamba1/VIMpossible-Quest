import {state} from "./globals.js";

export function pointsAudio() {
    if (state.soundDisabled === false) {
        const Aud = new Audio("../data/audio/mixkit-retro-game-notification-212.wav");
        Aud.currentTime = 0;
        Aud.play();
    }
    
}

export function clickAudio() {
    if (state.soundDisabled === false) {
        const Aud = new Audio("../data/audio/mixkit-light-button-2580.wav")
        Aud.currentTime = 0;
        Aud.play();
    }
}

export function roundComplete() {
    if (state.soundDisabled === false) {
        const Aud = new Audio("../data/audio/mixkit-unlock-game-notification-253.wav");
        Aud.currentTime = 0;
        Aud.play();
    }
}

export function roundLost() {
    if (state.soundDisabled === false) {
        const Aud = new Audio("../data/audio/mixkit-player-losing-or-failing-2042.wav");
        Aud.currentTime = 0;
        Aud.play();
    }
}