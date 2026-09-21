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
    challengeStartTime: null,    /* A var for when the challenge started so points can be awarded accordingly. */
    totalPoints: 0,       /* A number of points the player has gained throughout the run. */
    pointsThisRound: 0,      /* A number of points the player has gained this round. */
    pointsNeeded: 1000,      /* The number of points needed to pass the round. */
    unlockedTypes: ["movement", "deletion"]     /* Unlocked types of challenges the user can get depending on the commands he has unlocked. */
}

// Lines used for creating text for the player
export const codeLines = [
    "users = []",
    "scores = [12, 24, 36, 48]",
    "current_index = 0",
    "total_score = 0",
    "max_attempts = 5",
    "player_name = 'Alex'",
    "is_active = True",
    "settings = {}",
    "items = []",
    "queue = []",

    "player = {'name': player_name}",
    "user = {'id': 42, 'active': True}",
    "item = {'name': 'Sword', 'value': 50}",
    "position = {'x': 10, 'y': 20}",
    "config = {'volume': 80, 'muted': False}",

    "if len(users) == 0:",
    "    print('No users found')",

    "if score > max_attempts:",
    "    print('Too many attempts')",

    "if is_active and total_score > 0:",
    "    print('Player is active')",

    "if not player['active']:",
    "    print('Player is inactive')",

    "if current_index >= len(scores):",
    "    print('Reached the end')",

    "if item['value'] < 10:",
    "    print('Item is cheap')",

    "if len(player_name) > 3:",
    "    print('Valid player name')",

    "for user in users:",
    "    print(user['name'])",

    "for item in items:",
    "    total_score += item['value']",

    "for score in scores:",
    "    print(score)",

    "for index in range(10):",
    "    print(index)",

    "while current_index < len(scores):",
    "    total_score += scores[current_index]",

    "while queue:",
    "    current = queue.pop(0)",

    "def calculate_score(points):",
    "    total = points * 2",

    "def create_player(name):",
    "    player = {'name': name, 'score': 0}",

    "def update_score(player, points):",
    "    player['score'] += points",

    "def find_user(users, user_id):",
    "    for user in users:",
    "        if user['id'] == user_id:",
    "            print(user['name'])",

    "active_users = [",
    "    user for user in users",
    "    if user['active']",
    "]",

    "names = [",
    "    user['name'] for user in users",
    "]",

    "high_scores = [",
    "    score for score in scores",
    "    if score > 50",
    "]",

    "scores.append(60)",
    "items.append(item)",
    "users.append(player)",
    "queue.append(user)",

    "first_user = users[0]",
    "last_score = scores[-1]",
    "first_item = items[0]",

    "total = sum(scores)",
    "average = total / len(scores)",

    "message = f'Score: {total_score}'",
    "greeting = f'Hello, {player_name}!'",

    "print(message)",
    "print('Game started')",
    "print('Loading settings')",

    "name = input('Enter your name: ')",
    "name = name.strip()",

    "number = int(input('Enter a number: '))",
    "number += 10",

    "random_index = random.randrange(len(items))",
    "random_item = items[random_index]",

    "next_index = min(current_index + 1, len(scores))",
    "previous_index = max(current_index - 1, 0)",

    "copy = items.copy()",
    "updated = {**player, 'score': total_score}",

    "del settings['theme']",
    "items.pop(current_index)",

    "scores.sort(reverse=True)",
    "items.reverse()",
    "queue.clear()",

    "player.update({'score': total_score})",
    "name = player.get('name', 'Unknown')",
    "score = player.get('score', 0)",

    "if score >= 100:",
    "    print('High score')",
    "else:",
    "    print('Keep going')",

    "if score > 50:",
    "    bonus = 10",
    "else:",
    "    bonus = 0",

    "for score in scores:",
    "    total_score += score",

    "for item in items:",
    "    if item['value'] > 20:",
    "        print(item['name'])",

    "while total_score < 100:",
    "    total_score += 10",

    "if queue:",
    "    current = queue[0]",

    "if player['score'] > 100:",
    "    player['level'] += 1"
];