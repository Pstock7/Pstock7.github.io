/**
 * This file contains the implementation for an action RPG with Dungeon-Crawling elements
 *
 * @author Patrick Stock
 */

// This idea for enums was adapted from this source: https://www.sohamkamani.com/javascript/enums/
const gameStates = Object.freeze({
    Menu: Symbol("menu"),
    Instructions: Symbol("instructions"),
    Game: Symbol("game"),
    GameOver: Symbol("gameover"),
    WinScreen: Symbol("winscreen"),
});

// Main game object
const game = {
    // Stores the current game state
    currentGameState: gameStates.Menu,
    keyArray: [],
    player: null,
    enemies: [],
    particles: [],
    wallImg: null,
}

// Text objects that are created on startup
const pixelText = {
    logoWords: stringToPixelArt("The\nForgotten\nDepths"),
    authorWords: stringToPixelArt("By:Patrick Stock"),
    menuStart: stringToPixelArt("Start"),
    menuInstructions: stringToPixelArt("Instructions"),
    instructions: stringToPixelArt("Use the arrow keys to move.\nPress z to attack or select.\nPress x to cancel."),
    back: stringToPixelArt("Back"),
    wip: stringToPixelArt("Work in Progress"),
}

/**
 * Runs if the mouse has been clicked
 */
function mouseClicked() {
    switch (game.currentGameState) {
        case gameStates.Menu:
            if (mouseX > 0 && mouseX < 82 && mouseY > 290 && mouseY < 324) {
                game.currentGameState = gameStates.Game;
            } else if (mouseX > 0 && mouseX < 166 && mouseY > 340 && mouseY < 374) {
                game.currentGameState = gameStates.Instructions;
            }
            break;
        case gameStates.Instructions:
            if (mouseX > 0 && mouseX < 70 && mouseY > 340 && mouseY < 374) {
                game.currentGameState = gameStates.Menu;
            }
            break;
    }
}

/**
 * Sets the key being pressed to a 1 in the key array
 */
function keyPressed() {
    game.keyArray[keyCode] = 1;
}

/**
 * Sets the key that was released to a 0 in the key array
 */
function keyReleased() {
    game.keyArray[keyCode] = 0;
}

/**
 * Setup the game before drawing to the screen.
 */
function setup() {
    createCanvas(400, 400);
    game.wallImg = loadImage("wall-pixel-art.png");
    // Initialize important game components
    reset();
}

/**
 * Reset the game
 */
function reset() {
    game.player = new Player(100, 200);
    game.enemies.push(new Slime(300, 200));
}

/**
 * Draws words to the screen
 */
function drawWords(x, y, words, pixelSize, color) {
    let originalX = x;
    noStroke();
    fill(color);
    for (let word = 0; word < words.length; word++) {
        for (let letter = 0; letter < words[word].length; letter++) {
            for (let pixelY = 0; pixelY < words[word][letter].length; pixelY++) {
                for (let pixelX = 0; pixelX < words[word][letter][pixelY].length; pixelX++) {
                    let pixel = words[word][letter][pixelY][pixelX];
                    if (pixel === "x") {
                        rect(x + pixelSize * pixelX, y + pixelSize * pixelY, pixelSize, pixelSize);
                    }
                }
            }
            x += 12 * pixelSize;
        }
        x = originalX;
        y += 20 * pixelSize;
    }
}

/**
 * Draws the menu screen
 */
function drawMenu() {
    noSmooth();
    let imgSize = 100;
    for (let x = 0; x < width; x += imgSize) {
        for (let y = 0; y < height; y += imgSize) {
            image(game.wallImg, x, y, imgSize, imgSize);
        }
    }
    drawWords(12, 36, pixelText.logoWords, 3, color(230));
    drawWords(12, 224, pixelText.authorWords, 1.5, color(230));
    let startColor = color(0, 160, 0);
    if (mouseX > 0 && mouseX < 82 && mouseY > 290 && mouseY < 324) {
        startColor = color(255);
    }
    drawWords(12, 300, pixelText.menuStart, 1, startColor);
    let instructionsColor = color(230, 230, 0);
    if (mouseX > 0 && mouseX < 166 && mouseY > 340 && mouseY < 374) {
        instructionsColor = color(255);
    }
    drawWords(12, 350, pixelText.menuInstructions, 1, instructionsColor);
}

/**
 * Draws the instructions screen
 */
function drawInstructions() {
    background(50);
    drawWords(12, 36, pixelText.instructions, 1, color(230));
    let backColor = color(230, 0, 0);
    if (mouseX > 0 && mouseX < 70 && mouseY > 340 && mouseY < 374) {
        backColor = color(255);
    }
    drawWords(12, 350, pixelText.back, 1, backColor);
    for (let i = 0; i < game.particles.length; i++) {
        game.particles[i].draw();
        if (game.particles[i].timer === 0) {
            game.particles.splice(i, 1);
        }
    }
    for (let i = 0; i < game.enemies.length; i++) {
        game.enemies[i].draw();
        game.enemies[i].update();
    }
    game.player.draw();
    game.player.control();
}

/**
 * Draw the game to the screen
 */
function drawGame() {
    background(50);
    drawWords(12, 150, pixelText.wip, 2, color(230));
}

/**
 * Draws the game over message to the screen
 */
function drawGameOver() {
}

/**
 * Draws the win message to the screen
 */
function drawWinScreen() {
}

/**
 * Main draw loop for drawing the current game state
 */
function draw() {
    // Draw whichever game state we are in
    if (game.currentGameState === gameStates.Menu) {
        drawMenu();
    } else if (game.currentGameState === gameStates.Instructions) {
        drawInstructions();
    } else if (game.currentGameState === gameStates.Game) {
        drawGame();
    } else if (game.currentGameState === gameStates.GameOver) {
        drawGameOver();
    } else if (game.currentGameState === gameStates.WinScreen) {
        drawWinScreen();
    }
}
