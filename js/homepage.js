import { commandData } from "./commandData.js";

const explanationDiv = document.getElementById("command-explanation");
const commandName = document.getElementById("command-name");
const commandCategory = document.getElementById("command-category");
const commandDescription = document.getElementById("command-description");

const commands = document.querySelectorAll(".command");



function updateExplanation(name) {
    const command = commandData[name];
    commandName.textContent = name + ": " + command["name"];
    commandCategory.textContent = "Category: " + command["category"];
    commandDescription.textContent = "Description: " + command["description"];
}


commands.forEach(command => {
    command.addEventListener("mouseenter", () => updateExplanation(command.textContent));
});

let darkmode = localStorage.getItem("darkmode");
if (darkmode === "active") {
    enableDarkMode();
}

const themeSwitch = document.querySelector(".theme-toggle");
themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem("darkmode");
    darkmode !== "active" ? enableDarkMode() : disableDarkMode();
})

function enableDarkMode() {
    document.documentElement.classList.add("darkmode");
    localStorage.setItem("darkmode", "active");
}

function disableDarkMode() {
    document.documentElement.classList.remove("darkmode");
    localStorage.setItem("darkmode", null);
}