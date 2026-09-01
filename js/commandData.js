export const commandData = {
    h: {
        name: "Move Left",
        description: "Move the cursor one character to the left.",
        category: "Navigation"
    },

    j: {
        name: "Move Down",
        description: "Move the cursor down one line.",
        category: "Navigation"
    },

    k: {
        name: "Move Up",
        description: "Move the cursor up one line.",
        category: "Navigation"
    },

    l: {
        name: "Move Right",
        description: "Move the cursor one character to the right.",
        category: "Navigation"
    },

    w: {
        name: "Next Word",
        description: "Move the cursor to the next word.",
        category: "Motion"
    },

    dw: {
        name: "Delete Word",
        description: "Delete from the cursor to the beginning of the next word.",
        category: "Editing"
    },

    dd: {
        name: "Delete Line",
        description: "Delete the current line.",
        category: "Editing"
    },

    x: {
        name: "Delete Character",
        description: "Delete the character under the cursor.",
        category: "Editing"
    },

    A: {
        name: "Append Text",
        description: "Moves the cursor to the end of the line and enters insert mode.",
        category: "Editing"
    },

    i: {
        name: "Insert Text",
        description: "Enters insert mode.",
        category: "Editing"
    },

    b: {
        name: "Previous Word",
        description: "Jump backwards to the start of a word",
        category: "Motion"
    }
};