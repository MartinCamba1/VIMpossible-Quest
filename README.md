# VIMpossible Quest

A browser-based roguelite game for learning and practicing Vim commands.

VIMpossible Quest combines a **Vim trainer** with **roguelite mechanics**. Instead of simply practicing commands in a static editor, you complete challenges, earn points, unlock new skills, and progress through increasingly difficult rounds.

![VIMpossible Quest gameplay](data/visuals/screenshot.png)

## Features

- Vim-style keyboard controls
- Interactive terminal-like game area
- Multiple types of challenges
- Real-time challenge timer
- Score based on speed and performance
- Mistake tracking
- Progressive skill unlocking
- Randomized challenges
- Ghost-word challenges
- Light and dark mode
- Sound toggle
- Persistent settings using `localStorage`
- No backend or account required

## How It Works

Each round gives you a Vim-related challenge that you have to complete using keyboard commands.

For example, you might need to:

- move the cursor to a specific character
- delete a word
- delete a single character
- insert a specific word
- complete a challenge involving a ghost word

Successfully completing a round rewards you with points and can unlock a new Vim skill.

The goal is to gradually build familiarity with Vim commands while keeping the practice closer to a game than a traditional typing trainer.

## Challenges

VIMpossible Quest currently contains several challenge types:

### Movement

Move the cursor to a specific character using Vim movement commands such as:

```text
h   j   k   l
```

### Word Deletion

Practice Vim deletion commands such as:

```text
dw
de
d$
```

The challenge system also supports counts, allowing commands such as:

```text
d2w
```

### Character Deletion

Delete individual characters using:

```text
x
```

### Word Insertion

Switch to insert mode and type the required text:

```text
i
```

### Ghost Challenges

Some challenges introduce a temporary "ghost" word into the terminal.

The ghost word is visually highlighted and must be interacted with as part of the challenge. This adds another layer of difficulty and makes the challenge state more dynamic.

## Vim Command System

Commands are represented internally and checked against the current game state.

The project supports basic movement:

| Command | Action |
|---|---|
| `h` | Move left |
| `j` | Move down |
| `k` | Move up |
| `l` | Move right |

Deletion commands include:

| Command | Action |
|---|---|
| `x` | Delete character |
| `dw` | Delete to the beginning of the next word |
| `de` | Delete to the end of the current word |
| `d$` | Delete to the end of the line |

The command parser is designed to distinguish between simple commands and more complex combinations involving operators, counts, and motions.

For example:

```text
d2w
```

is interpreted as:

```text
operator = d
count    = 2
motion   = w
```

This allows the command system to be extended with additional Vim functionality without having to implement every command separately.

## Scoring

The score rewards completing challenges quickly while still allowing slower players to earn points.

A round starts with a base score and decreases as more time is spent on the challenge.

The current scoring system is based on an exponential decay:

```text
score = 50 + 350 × e^(-0.3 × time)
```

Successful rounds also receive an additional round multiplier.

This makes speed useful, but completing the challenge correctly remains the primary goal.

## Progression

VIMpossible Quest uses a skill-unlocking system.

After successfully completing a round, one of several available skills can be unlocked.

This creates a progression loop:

```text
Challenge
    ↓
Complete challenge
    ↓
Earn points
    ↓
Unlock skill
    ↓
New challenges become available
    ↓
More difficult gameplay
```

The available challenges therefore change as the player progresses.

## Interface

The game is built around a terminal-like interface rather than a traditional text input.

Characters in the challenge text are represented by individual elements, allowing the game to:

- visually move the cursor
- highlight individual characters
- mark mistakes
- display protected characters
- animate ghost words
- manipulate text during Vim operations

The cursor is tracked separately from the displayed text, allowing Vim-like movement and deletion behaviour to be implemented in JavaScript.

## Data & State

The game keeps its runtime state in JavaScript.

Some of the state includes:

- current cursor position
- challenge type
- challenge target
- characters currently displayed
- available commands
- unlocked skills
- timer state
- challenge start time
- paused time
- sound state
- theme state

User preferences such as the theme and sound settings are stored using `localStorage`.

For example:

```text
darkmode = active
sound = muted
```

This allows settings to persist between sessions without requiring a backend.

## Tech Stack

- **HTML** — page structure
- **CSS** — styling, animations and responsive terminal interface
- **JavaScript** — game logic, Vim commands, challenges and state management
- **localStorage** — persistent client-side settings

No framework or backend is required.

## Running Locally

Clone the repository:

```bash
git clone https://github.com/MartinCamba1/Vim-Trainer.git
```

Enter the project directory:

```bash
cd Vim-Trainer
```

Then open the project in a browser.

Because the project is entirely client-side, no server or database setup is required.

Alternatively, it can be served using any simple local development server.

## Project Goals

The main goal of VIMpossible Quest is to make learning Vim commands more engaging.

Traditional Vim trainers are useful for repetition, but they can become monotonous. This project experiments with combining command practice with game mechanics such as:

- progression
- score
- challenges
- randomization
- skill unlocking
- visual feedback

The project is also an opportunity to explore how a relatively complex interactive application can be built using plain HTML, CSS and JavaScript without relying on a framework.

## Future Improvements

Possible future improvements include:

- More Vim motions and operators
- More complex command combinations
- Additional challenge types
- More roguelite mechanics
- Improved difficulty progression
- High-score system
- More terminal interactions
- Better handling of visually wrapped lines
- Additional animations and sound effects
- More advanced Vim word-motion behaviour

## License

This project is open source. See the repository for the applicable license and source code.