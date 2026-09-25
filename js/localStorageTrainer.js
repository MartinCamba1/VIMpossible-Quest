import { state } from "./globals.js";

/*      Light/Dark Mode     */

let darkmode = localStorage.getItem("darkmode");
const sunSvg = document.querySelector(".light-mode");
const moonSvg = document.querySelector(".dark-mode");
if (darkmode === "active") {
    sunSvg.classList.remove("hidden");
    moonSvg.classList.add("hidden");
    enableDarkMode();
}

const themeSwitch = document.querySelector(".theme-toggle");
themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem("darkmode");
    darkmode !== "active" ? enableDarkMode() : disableDarkMode();
})

function enableDarkMode() {
    document.documentElement.classList.add("darkmode");
    sunSvg.classList.remove("hidden");
    moonSvg.classList.add("hidden");
    localStorage.setItem("darkmode", "active");
}

function disableDarkMode() {
    document.documentElement.classList.remove("darkmode");
    moonSvg.classList.remove("hidden");
    sunSvg.classList.add("hidden");
    localStorage.setItem("darkmode", null);
}

/* ===================================================== */

/*      Sound Control       */

let muted = localStorage.getItem("muted");
const volumeOnEl = document.querySelector(".volume-on");
const volumeOffEl = document.querySelector(".volume-off");

const soundSwitch = document.querySelector(".sound-toggle");
if (volumeOnEl && volumeOffEl && soundSwitch) {
    if (muted === "active") {
        disableSound();
    }

    soundSwitch.addEventListener("click", () => {
        muted = localStorage.getItem("muted");

        if (localStorage.getItem("muted") === "active") {
            enableSound();
        } else {
            disableSound();
        }
    })

    function enableSound() {
        volumeOnEl.classList.remove("hidden");
        volumeOffEl.classList.add("hidden");
        localStorage.setItem("muted", null);
        state.soundDisabled = false;
    }

    function disableSound() {
        volumeOnEl.classList.add("hidden");
        volumeOffEl.classList.remove("hidden");
        localStorage.setItem("muted", "active");
        state.soundDisabled = true;
    }
}


/* ===================================================== */