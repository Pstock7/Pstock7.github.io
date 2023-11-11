const levelTilemaps = {
    0: [
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "    p          s    ",
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
    ],
    1: [
        "                    ",
        "                    ",
        "              s     ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "     p        s     ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "              s     ",
        "                    ",
        "                    ",
    ],
    2: [
        "                    ",
        "                    ",
        "     p        s     ",
        "                    ",
        "                    ",
        "                    ",
        "            s       ",
        "                    ",
        "                    ",
        "      s             ",
        "                    ",
        "                    ",
        " s                  ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
    ],
    3: [
        "                    ",
        "                    ",
        "     p        s     ",
        "                    ",
        "                    ",
        "                    ",
        "            s       ",
        "                    ",
        "                    ",
        "      s             ",
        "                    ",
        "                    ",
        " s                  ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
    ],
}

function initTilemap(level) {
    let tilemap = levelTilemaps[level];
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
                    game.enemies.push(new Slime(x, y));
                    break;
            }
        }
    }
}