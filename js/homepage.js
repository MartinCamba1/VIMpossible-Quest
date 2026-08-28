import { commandData } from "./commandData.js";

const explanationDiv = document.getElementById("command-explanation");
const commandName = document.getElementById("command-name");
const commandCategory = document.getElementById("command-category");
const commandDescription = document.getElementById("command-description");

const commands = document.querySelectorAll(".command");



function updateExplanation(name) {
    const command = commandData[name];
    commandName.textContent = command["name"];
    commandCategory.textContent = "Category: " + command["category"];
    commandDescription.textContent = "Description: " + command["description"];
}


commands.forEach(command => {
    command.addEventListener("mouseenter", () => updateExplanation(command.textContent));
});
