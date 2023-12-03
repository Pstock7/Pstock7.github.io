function initTilemap(level) {
    let tilemap = generateTilemap(level);
    for (let i = 0; i < tilemap.length; i++) {
        for (let j = 0; j < tilemap[i].length; j++) {
            let x = j * 20 + 10;
            let y = i * 20 + 10;

            switch (tilemap[i][j]) {
                case " ":
                    continue;
                case "p":
                    game.player = new Player(x, y);
                    break;
                case "s":
                    game.enemies.push(new Slime(x, y, 5));
                    break;
                case "b":
                    game.enemies.push(new BigSlime(x, y, 10));
                    break;
                case "x":
                    game.enemies.push(new BossSlime(x, y, 20));
                    break;
                case "z":
                    game.enemies.push(new Zombie(x, y, 5));
                    break;
            }
        }
    }
}

function generateTilemap(level) {
    let tilemap = [
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "         p          ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
    ];

    if (level === 0) {
        tilemap = addToMap(tilemap, "s", 1, 14, 10);
    } else if (level === 1) {
        tilemap = addToMap(tilemap, "s");
    } else if (level === 2) {
        tilemap = addToMap(tilemap, "s", 2);
        tilemap = addToMap(tilemap, "z");
    } else if (level <= 4) {
        tilemap = addToMap(tilemap, "s", level);
        tilemap = addToMap(tilemap, "z");
        tilemap = addToMap(tilemap, "b");
    } else if (level % 5 === 0) {
        tilemap = addToMap(tilemap, "x", level / 5);
        tilemap = addToMap(tilemap, "s", (level / 5 - 1) * 3);
        tilemap = addToMap(tilemap, "z", (level / 5 - 1) * 3);
    } else {
        let randomAmount = random(floor(level / 4), floor(level * 0.75));
        tilemap = addToMap(tilemap, "s", randomAmount);
        tilemap = addToMap(tilemap, "z", level - randomAmount);
        tilemap = addToMap(tilemap, "b", floor(level / 2));
    }

    return tilemap;
}

function addToMap(tilemap, character, numThings = 1, xPos = -1, yPos = -1) {
    if (xPos === -1 && yPos === -1) {
        // Get a random coordinate to put the character in the tilemap
        let x = int(random(0, 19));
        let y = int(random(0, 19));
        for (let i = 0; i < numThings; i++) {
            // If we are too close to the player's starting position, get a new random coordinate
            // If the coordinate is not empty, get a new random coordinate
            while (
                tilemap[y][x] !== " " ||
                (x > 4 && x < 14) &&
                (y > 4 && y < 14)
                ) {
                x = int(random(0, 19));
                y = int(random(0, 19));
            }
            // Place the character in the map in the correct location
            tilemap[y] =
                tilemap[y].substring(0, x) + character + tilemap[y].substring(x + 1);
        }
    } else if (numThings === 1) {
        // Place the character in the map in the correct location
        tilemap[yPos] =
            tilemap[yPos].substring(0, xPos) + character + tilemap[yPos].substring(xPos + 1);
    }
    return tilemap;
}
