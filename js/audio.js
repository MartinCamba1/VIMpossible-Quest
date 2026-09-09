export function pointsAudio() {
    const Aud = new Audio("../data/audio/mixkit-retro-game-notification-212.wav");
    Aud.currentTime = 0;
    Aud.play();
}

export function clickAudio() {
    const Aud = new Audio("../data/audio/mixkit-light-button-2580.wav")
    Aud.currentTime = 0;
    Aud.play();
}