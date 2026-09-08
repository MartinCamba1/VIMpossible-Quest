export const state = {
    cursor:  {      /* An object containing the position of the cursor. */
        col: 0,
        row: 0
    },
    spans: [],      /* Array for each line and span for each character in each array. */
    characters: [],        /* Array(44) [ "T", "h", "e", … ] */
    brElArr: [],       /* <br> for each line */
    inputBuffer: [],    /* An array that cointains the command keys pressed and when no command can be made it is emptied. */
    mode: "normal",     /* A mode that is used, 'normal' or 'insert'. */
    challenge: {},      /* An object for the challenge selected. */
    challengeStartTime: null    /* A var for when the challenge started so points can be awarded accordingly. */
}