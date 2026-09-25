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