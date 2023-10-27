/**
 * This file contains the implementation for a Space Invaders game with
 * particle effects
 *
 * @author Patrick Stock
 */

/**
 * Class that defines an invader object that drops bombs
 * and moves back and forth.
 */
class invaderObj {
    constructor(x, y) {
        // Initial x and y position
        this.position = new p5.Vector(x, y);
        this.xVel = 1;
        // Initially not dead
        this.health = 2;
    }

    // Draw the invader to the screen
    draw() {
        // If dead, emit ash particles
        if (this.health <= 0) {
            if (frameCount % 2 === 0 && this.position.y < height) {
                game.particles.push(new ashParticle(this.position.x, this.position.y));
            }
            return;
        }
        fill(37, 238, 238);
        noStroke();
        // Draw invader to the screen
        image(game.invaderArt, this.position.x - 17, this.position.y - 17, 35, 35);
    }

    // Move the invader every frame
    move() {
        // Move the invader downward if it is dead
        if (this.health <= 0) {
            // Stop moving invader once off the screen
            if (this.position.y >= height) {
                return;
            }
            this.position.y += 2;
            return;
        }
        // Add randomly assigned velocity to the position
        this.position.x += this.xVel;
        // Negate the velocity when the edge of the screen is hit
        if (this.position.x <= 17 || this.position.x >= 383) {
            this.xVel = -this.xVel;
        }
    }
} // invaderObj

/**
 * Class that defines the gun that the player controls
 */
class gunObj {
    constructor(x) {
        this.x = x;
    }

    // Draw the gun to the screen
    draw() {
        // Draw the pixel art to the screen
        for (var i = 0; i < gunPixelArt.length; i++) {
            for (var j = 0; j < gunPixelArt[0].length; j++) {
                // Spaces are empty
                if (gunPixelArt[i][j] === " ") {
                    continue;
                }
                // White pixel
                else if (gunPixelArt[i][j] === "w") {
                    fill(255);
                }
                // Red pixel
                else if (gunPixelArt[i][j] === "r") {
                    fill(255, 0, 0);
                }
                // Blue pixel
                else if (gunPixelArt[i][j] === "b") {
                    fill(0, 0, 255);
                }
                // Draw the rectangle in the appropriate position
                rect(this.x + 2 * j - 11, height + 2 * i - 22, 2, 2);
            }
        }
    }

    // Move the gun every frame if a key is pressed
    move() {
        // Detects if the A key or left arrow key is pressed
        if (
            (game.keyArray[LEFT_ARROW] === 1 || game.keyArray["A".charCodeAt(0)] === 1) &&
            this.x > 11
        ) {
            // Move the gun to the left
            this.x--;
        }
        // Detects if the D key or right arrow key is pressed
        if (
            (game.keyArray[RIGHT_ARROW] === 1 || game.keyArray["D".charCodeAt(0)] === 1) &&
            this.x < 389
        ) {
            // Move the gun to the right
            this.x++;
        }
    }
} // gunObj

/**
 * This class defines the bullet object that the player
 * shoots at the invaders to kill them
 */
class bulletObj {
    constructor() {
        // Initial position set externally
        this.position = new p5.Vector(0, 0);
        // Initially not fired
        this.fire = 0;
    }

    // Draw the bullet to the screen
    draw() {
        if (this.fire === 0) {
            return;
        }
        // Draw the object to the screen
        fill(255);
        rect(this.position.x - 1, this.position.y, 2, 5);
        fill(255, 0, 0);
        triangle(this.position.x - 4, this.position.y,
            this.position.x + 4, this.position.y,
            this.position.x, this.position.y - 4);
        // Move the object upward
        this.position.y -= 5;
        // Stop displaying the bullet once it passes the top of the screen
        if (this.position.y < 0) {
            this.fire = 0;
        }
        let endGame = true;
        for (var i = 0; i < game.invaders.length; i++) {
            // Collision detection for bullet and invader
            if (game.invaders[i].health > 0 && this.position.dist(game.invaders[i].position) < 20) {
                // Damage the invader
                game.invaders[i].health--;
                // Drop a bomb on 1 health
                if (game.invaders[i].health === 1) {
                    game.bombs[i].dropped = 1;
                    game.bombs[i].position.x = game.invaders[i].position.x;
                    game.bombs[i].position.y = game.invaders[i].position.y + 17;
                }
                // Bullet disappears if it hits an invader
                this.fire = 0;
            }
            // Only end the game if all the invaders have 0 health
            if (game.invaders[i].health > 0) {
                endGame = false;
            }
        }
        if (endGame) {
            game.currentGameState = gameStates.WinScreen;
        }
    }
} // bulletObj

/**
 * This class defines the bombs the invaders
 * shoot back at the player.
 */
class bombObj {
    constructor() {
        // Initial position set externally
        this.position = new p5.Vector(0, 0);
        // Initially not dropped
        this.dropped = 0;
    }

    // Draw the bombs to the screen every frame
    draw() {
        // Calculate direction to the player
        let directionToPlayer = new p5.Vector(this.position.x - game.gun.x, this.position.y - height + 11);
        directionToPlayer.normalize();
        directionToPlayer.mult(3);
        // Draw the bomb object
        push();
        translate(this.position.x, this.position.y);
        // Rotate to direction of player
        rotate(directionToPlayer.heading() + HALF_PI);
        fill(255);
        rect(-4, -10, 8, 10);
        fill(255, 0, 0);
        triangle(-8, 0, 8, 0, 0, 8);
        pop();
        // Move the bomb object towards the player
        this.position.sub(directionToPlayer);
        // Emit exhaust particles
        game.particles.push(new exhaustParticle(this.position.x, this.position.y, directionToPlayer.heading() - HALF_PI));
        // Check if the bomb is hit by a bullet
        for (let i = 0; i < game.bullets.length; i++) {
            if (game.bullets[i].fire === 1 && this.position.dist(game.bullets[i].position) < 12) {
                // Bomb disappears
                this.dropped = 0;
                // Bullet disappears
                game.bullets[i].fire = 0;
                // Bomb creates explosion
                createExplosion(this.position.x, this.position.y);
            }
        }
        // Check if the bomb hit the player
        if (this.position.y > 380) {
            if (this.position.x > game.gun.x - 15 && this.position.x < game.gun.x + 15) {
                // Player loses if the bomb hit them
                game.currentGameState = gameStates.GameOver;
                // Bomb creates explosion
                createExplosion(this.position.x, this.position.y);
                // Gun creates explosion
                createExplosion(game.gun.x, height - 11);
            }
        }
    }
} // bombObj

/**
 * Defines an ash particle
 */
class ashParticle {
    constructor(x, y) {
        // Give an initial position and random velocity
        this.position = new p5.Vector(x, y);
        this.velocity = new p5.Vector(0.3, random(QUARTER_PI, 3 * QUARTER_PI));
        // 240 frame duration
        this.timer = 240;
        // Random size
        this.size = random(2, 4);
    }

    draw() {
        // Gray color with alpha for fade effect
        fill(255, 255, 255, this.timer);
        // Draw particle
        ellipse(this.position.x, this.position.y, this.size, this.size);
        // Use polar coordinates for velocity
        this.position.x += this.velocity.x * cos(this.velocity.y);
        this.position.y += this.velocity.x * sin(this.velocity.y);
        // Decrement timer
        this.timer--;
    }
}

/**
 * Defines an exhaust particle
 */
class exhaustParticle {
    constructor(x, y, angle) {
        // Give an initial position and random velocity
        this.position = new p5.Vector(x, y);
        this.velocity = new p5.Vector(random(0.5, 1), angle + random(-2, 2));
        // (240 / 8) = 30 frame duration
        this.timer = 240;
        // Random size
        this.size = random(4, 8);
    }

    draw() {
        // Gray color with alpha for fade effect
        fill(170, 170, 170, this.timer);
        // Draw particle
        ellipse(this.position.x, this.position.y, this.size, this.size);
        // Use polar coordinates for velocity
        this.position.x += this.velocity.x * cos(this.velocity.y);
        this.position.y += this.velocity.x * sin(this.velocity.y);
        // Decrement timer
        this.timer -= 8;
    }
}

/**
 * Defines an explosion particle
 */
class explosionParticle {
    constructor(x, y) {
        // Give an initial position and random velocity
        this.position = new p5.Vector(x, y);
        this.velocity = new p5.Vector(random(0, 0.3), random(0, TWO_PI));
        // Give a random color
        this.color = randomInt(1, 4);
        this.timer = 255;
        // Give a random size
        this.size = random(1, 3);
    }

    draw() {
        // Use the random color and the timer for alpha
        switch (this.color) {
            case 1:
                fill(255, 255, 255, this.timer);
                break;
            case 2:
                fill(255, 0, 0, this.timer);
                break;
            case 3:
                fill(255, 130, 0, this.timer);
                break;
            case 4:
                fill(255, 255, 0, this.timer);
                break;
        }
        // Draw particle
        ellipse(this.position.x, this.position.y, this.size, this.size);
        // Use polar coordinates for velocity
        this.position.x += this.velocity.x * cos(this.velocity.y);
        this.position.y += this.velocity.x * sin(this.velocity.y);
        // Decrement timer
        this.timer -= 2;
    }
}

/**
 * Creates an explosion at a location
 *
 * @param x x position
 * @param y y position
 */
function createExplosion(x, y) {
    // Spawn 200 explosion particles
    for (let i = 0; i < 200; i++) {
        game.particles.push(new explosionParticle(x, y));
    }
}

// This idea for enums was adapted from this source: https://www.sohamkamani.com/javascript/enums/
const gameStates = Object.freeze({
    Menu: Symbol("menu"),
    Game: Symbol("game"),
    GameOver: Symbol("gameover"),
    WinScreen: Symbol("winscreen"),
});

// Pixel art in the form of tile maps
var gunPixelArt = [
    "     w     ",
    "     w     ",
    "     w     ",
    "  r www r  ",
    "  w www w  ",
    "  wbwrwbw  ",
    "r bwrrrwb r",
    "w wwrwrww w",
    "wwwwwwwwwww",
    "ww rrwrr ww",
    "w    w    w",
];

// Main game object
const game = {
    // Stores the background stars that display throughout the game
    stars: [],
    // Stores the current game state
    currentGameState: gameStates.Menu,
    gun: null,
    invaders: [],
    keyArray: [],
    bullets: [],
    bulletIndex: 0,
    bombs: [],
    currFrameCount: 0,
    invaderArt: null,
    particles: [],
}

/**
 * Runs if the mouse has been clicked
 */
function mouseClicked() {
    // Check if we are on the menu and the start button is clicked
    if (game.currentGameState === gameStates.Menu) {
        if (mouseX >= 150 && mouseX <= 250 && mouseY >= 215 && mouseY <= 265)
            game.currentGameState = gameStates.Game;
    }
    if (game.currentGameState === gameStates.GameOver || game.currentGameState === gameStates.WinScreen) {
        reset();
        game.currentGameState = gameStates.Menu;
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
 * Determines when bullets are fired
 */
function checkFire() {
    // Check if the space bar has been pressed
    if (game.keyArray[32] === 1) {
        // Check if it has been 10 frames since the last bullet
        if (game.currFrameCount < frameCount - 60) {
            game.currFrameCount = frameCount;
            // Fire the bullet
            game.bullets[game.bulletIndex].fire = 1;
            // Set the x and y positions of the bullet
            game.bullets[game.bulletIndex].position = new p5.Vector(game.gun.x, 380);
            // Iterate cyclically through the array of bullets
            game.bulletIndex++;
            if (game.bulletIndex >= game.bullets.length) {
                game.bulletIndex = 0;
            }
        }
    }
}

/**
 * Saves invader art as an image so the complex shape
 * does not have to be drawn every time.
 */
function initInvaderArt() {
    noStroke();
    fill(37, 238, 238);
    beginShape();
    vertex(216.75, 103.23957824707031);
    vertex(225.25, 103.42707824707031);
    vertex(233.4990234375, 103.77571105957031);
    vertex(241.4970703125, 104.28547668457031);
    vertex(249.244140625, 104.95637512207031);
    vertex(256.740234375, 105.78840637207031);
    vertex(263.9853515625, 106.78157043457031);
    vertex(270.9794921875, 107.93586730957031);
    vertex(277.72265625, 109.25129699707031);
    vertex(284.21484375, 110.72785949707031);
    vertex(290.4560546875, 112.36555480957031);
    vertex(296.4462890625, 114.16438293457031);
    vertex(302.185546875, 116.12434387207031);
    vertex(307.673828125, 118.24543762207031);
    vertex(312.9111328125, 120.52766418457031);
    vertex(317.8974609375, 122.97102355957031);
    vertex(322.6328125, 125.57551574707031);
    vertex(327.1171875, 128.3411407470703);
    vertex(331.3505859375, 131.2678985595703);
    vertex(335.3330078125, 134.3557891845703);
    vertex(339.064453125, 137.6048126220703);
    vertex(342.544921875, 141.0149688720703);
    vertex(345.7744140625, 144.5862579345703);
    vertex(348.7529296875, 148.3186798095703);
    vertex(351.48046875, 152.2122344970703);
    vertex(353.95703125, 156.2669219970703);
    vertex(356.1826171875, 160.4827423095703);
    vertex(358.1572265625, 164.8596954345703);
    vertex(359.880859375, 169.3977813720703);
    vertex(361.353515625, 174.0970001220703);
    vertex(362.5751953125, 178.9573516845703);
    vertex(363.5458984375, 183.9788360595703);
    vertex(364.265625, 189.1614532470703);
    vertex(364.734375, 194.5052032470703);
    vertex(365.068359375, 199.6761016845703);
    vertex(365.267578125, 204.6741485595703);
    vertex(365.33203125, 209.4993438720703);
    vertex(365.26171875, 214.1516876220703);
    vertex(365.056640625, 218.6311798095703);
    vertex(364.716796875, 222.9378204345703);
    vertex(364.2421875, 227.0716094970703);
    vertex(363.6328125, 231.0325469970703);
    vertex(362.888671875, 234.8206329345703);
    vertex(362.009765625, 238.4358673095703);
    vertex(360.99609375, 241.8782501220703);
    vertex(359.84765625, 245.1477813720703);
    vertex(358.564453125, 248.2444610595703);
    vertex(357.146484375, 251.1682891845703);
    vertex(355.59375, 253.9192657470703);
    vertex(353.90625, 256.4973907470703);
    vertex(352.083984375, 258.9026641845703);
    vertex(350.126953125, 261.1350860595703);
    vertex(348.03515625, 263.1946563720703);
    vertex(345.80859375, 265.0813751220703);
    vertex(343.447265625, 266.7952423095703);
    vertex(340.951171875, 268.3362579345703);
    vertex(338.3203125, 269.7044219970703);
    vertex(335.5546875, 270.8997344970703);
    vertex(332.654296875, 271.9221954345703);
    vertex(329.619140625, 272.7718048095703);
    vertex(326.44921875, 273.4485626220703);
    vertex(323.14453125, 273.9524688720703);
    vertex(319.705078125, 274.2835235595703);
    vertex(316.130859375, 274.4417266845703);
    vertex(312.421875, 274.4270782470703);
    vertex(308.578125, 274.2395782470703);
    vertex(304.9169921875, 274.0071563720703);
    vertex(301.4384765625, 273.7298126220703);
    vertex(298.142578125, 273.4075469970703);
    vertex(295.029296875, 273.0403594970703);
    vertex(292.0986328125, 272.6282501220703);
    vertex(289.3505859375, 272.1712188720703);
    vertex(286.78515625, 271.6692657470703);
    vertex(284.40234375, 271.1223907470703);
    vertex(282.2021484375, 270.5305938720703);
    vertex(280.1845703125, 269.8938751220703);
    vertex(278.349609375, 269.2122344970703);
    vertex(276.697265625, 268.4856719970703);
    vertex(275.2275390625, 267.7141876220703);
    vertex(273.9404296875, 266.8977813720703);
    vertex(272.8359375, 266.0364532470703);
    vertex(271.9140625, 265.1302032470703);
    vertex(271.1748046875, 264.1790313720703);
    vertex(270.6181640625, 263.1829376220703);
    vertex(270.244140625, 262.1419219970703);
    vertex(270.052734375, 261.0559844970703);
    vertex(270.0439453125, 259.9251251220703);
    vertex(270.2177734375, 258.7493438720703);
    vertex(270.57421875, 257.5286407470703);
    vertex(271.11328125, 256.2630157470703);
    vertex(271.8349609375, 254.9524688720703);
    vertex(272.7392578125, 253.5970001220703);
    vertex(273.826171875, 252.1966094970703);
    vertex(275.095703125, 250.7512969970703);
    vertex(276.5478515625, 249.2610626220703);
    vertex(278.1826171875, 247.7259063720703);
    vertex(280, 246.1458282470703);
    vertex(282, 244.5208282470703);
    vertex(283.76953125, 242.9427032470703);
    vertex(285.30859375, 241.4114532470703);
    vertex(286.6171875, 239.9270782470703);
    vertex(287.6953125, 238.4895782470703);
    vertex(288.54296875, 237.0989532470703);
    vertex(289.16015625, 235.7552032470703);
    vertex(289.546875, 234.4583282470703);
    vertex(289.703125, 233.2083282470703);
    vertex(289.62890625, 232.0052032470703);
    vertex(289.32421875, 230.8489532470703);
    vertex(288.7890625, 229.7395782470703);
    vertex(288.0234375, 228.6770782470703);
    vertex(287.02734375, 227.6614532470703);
    vertex(285.80078125, 226.6927032470703);
    vertex(284.34375, 225.7708282470703);
    vertex(282.65625, 224.8958282470703);
    vertex(280.73828125, 224.0677032470703);
    vertex(278.58984375, 223.2864532470703);
    vertex(276.2109375, 222.5520782470703);
    vertex(273.6015625, 221.8645782470703);
    vertex(270.76171875, 221.2239532470703);
    vertex(267.69140625, 220.6302032470703);
    vertex(264.390625, 220.0833282470703);
    vertex(260.859375, 219.5833282470703);
    vertex(257.09765625, 219.1302032470703);
    vertex(253.10546875, 218.7239532470703);
    vertex(248.8828125, 218.3645782470703);
    vertex(244.4296875, 218.0520782470703);
    vertex(239.74609375, 217.7864532470703);
    vertex(234.83203125, 217.5677032470703);
    vertex(229.6875, 217.3958282470703);
    vertex(224.3125, 217.2708282470703);
    vertex(219.142578125, 217.2024688720703);
    vertex(214.177734375, 217.1907501220703);
    vertex(209.41796875, 217.2356719970703);
    vertex(204.86328125, 217.3372344970703);
    vertex(200.513671875, 217.4954376220703);
    vertex(196.369140625, 217.7102813720703);
    vertex(192.4296875, 217.9817657470703);
    vertex(188.6953125, 218.3098907470703);
    vertex(185.166015625, 218.6946563720703);
    vertex(181.841796875, 219.1360626220703);
    vertex(178.72265625, 219.6341094970703);
    vertex(175.80859375, 220.1887969970703);
    vertex(173.099609375, 220.8001251220703);
    vertex(170.595703125, 221.4680938720703);
    vertex(168.296875, 222.1927032470703);
    vertex(166.203125, 222.9739532470703);
    vertex(164.314453125, 223.8118438720703);
    vertex(162.630859375, 224.7063751220703);
    vertex(161.15234375, 225.6575469970703);
    vertex(159.87890625, 226.6653594970703);
    vertex(158.810546875, 227.7298126220703);
    vertex(157.947265625, 228.8509063720703);
    vertex(157.2890625, 230.0286407470703);
    vertex(156.8359375, 231.2630157470703);
    vertex(156.587890625, 232.5540313720703);
    vertex(156.544921875, 233.9016876220703);
    vertex(156.70703125, 235.3059844970703);
    vertex(157.07421875, 236.7669219970703);
    vertex(157.646484375, 238.2845001220703);
    vertex(158.423828125, 239.8587188720703);
    vertex(159.40625, 241.4895782470703);
    vertex(160.59375, 243.1770782470703);
    vertex(161.6279296875, 244.8216094970703);
    vertex(162.5087890625, 246.4231719970703);
    vertex(163.236328125, 247.9817657470703);
    vertex(163.810546875, 249.4973907470703);
    vertex(164.2314453125, 250.9700469970703);
    vertex(164.4990234375, 252.3997344970703);
    vertex(164.61328125, 253.7864532470703);
    vertex(164.57421875, 255.1302032470703);
    vertex(164.3818359375, 256.4309844970703);
    vertex(164.0361328125, 257.6887969970703);
    vertex(163.537109375, 258.9036407470703);
    vertex(162.884765625, 260.0755157470703);
    vertex(162.0791015625, 261.2044219970703);
    vertex(161.1201171875, 262.2903594970703);
    vertex(160.0078125, 263.3333282470703);
    vertex(158.7421875, 264.3333282470703);
    vertex(157.3232421875, 265.2903594970703);
    vertex(155.7509765625, 266.2044219970703);
    vertex(154.025390625, 267.0755157470703);
    vertex(152.146484375, 267.9036407470703);
    vertex(150.1142578125, 268.6887969970703);
    vertex(147.9287109375, 269.4309844970703);
    vertex(145.58984375, 270.1302032470703);
    vertex(143.09765625, 270.7864532470703);
    vertex(140.4521484375, 271.3997344970703);
    vertex(137.6533203125, 271.9700469970703);
    vertex(134.701171875, 272.4973907470703);
    vertex(131.595703125, 272.9817657470703);
    vertex(128.3369140625, 273.4231719970703);
    vertex(124.9248046875, 273.8216094970703);
    vertex(121.359375, 274.1770782470703);
    vertex(117.640625, 274.4895782470703);
    vertex(114.0625, 274.6175079345703);
    vertex(110.625, 274.5608673095703);
    vertex(107.328125, 274.3196563720703);
    vertex(104.171875, 273.8938751220703);
    vertex(101.15625, 273.2835235595703);
    vertex(98.28125, 272.4886016845703);
    vertex(95.546875, 271.5091094970703);
    vertex(92.953125, 270.3450469970703);
    vertex(90.5, 268.9964141845703);
    vertex(88.1875, 267.4632110595703);
    vertex(86.015625, 265.7454376220703);
    vertex(83.984375, 263.8430938720703);
    vertex(82.09375, 261.7561798095703);
    vertex(80.34375, 259.4846954345703);
    vertex(78.734375, 257.0286407470703);
    vertex(77.265625, 254.3880157470703);
    vertex(75.9130859375, 251.7376251220703);
    vertex(74.6767578125, 249.0774688720703);
    vertex(73.556640625, 246.4075469970703);
    vertex(72.552734375, 243.7278594970703);
    vertex(71.6650390625, 241.0384063720703);
    vertex(70.8935546875, 238.3391876220703);
    vertex(70.23828125, 235.6302032470703);
    vertex(69.69921875, 232.9114532470703);
    vertex(69.2763671875, 230.1829376220703);
    vertex(68.9697265625, 227.4446563720703);
    vertex(68.779296875, 224.6966094970703);
    vertex(68.705078125, 221.9387969970703);
    vertex(68.7470703125, 219.1712188720703);
    vertex(68.9052734375, 216.3938751220703);
    vertex(69.1796875, 213.6067657470703);
    vertex(69.5703125, 210.8098907470703);
    vertex(70.2509765625, 207.8440704345703);
    vertex(71.2216796875, 204.7093048095703);
    vertex(72.482421875, 201.4055938720703);
    vertex(74.033203125, 197.9329376220703);
    vertex(75.8740234375, 194.2913360595703);
    vertex(78.0048828125, 190.4807891845703);
    vertex(80.42578125, 186.5012969970703);
    vertex(83.13671875, 182.3528594970703);
    vertex(85.8232421875, 178.3792266845703);
    vertex(88.4853515625, 174.5803985595703);
    vertex(91.123046875, 170.9563751220703);
    vertex(93.736328125, 167.5071563720703);
    vertex(96.3251953125, 164.2327423095703);
    vertex(98.8896484375, 161.1331329345703);
    vertex(101.4296875, 158.2083282470703);
    vertex(103.9453125, 155.4583282470703);
    vertex(107.306640625, 152.3762969970703);
    vertex(111.513671875, 148.9622344970703);
    vertex(116.56640625, 145.2161407470703);
    vertex(122.46484375, 141.1380157470703);
    vertex(128.048828125, 137.4036407470703);
    vertex(133.318359375, 134.0130157470703);
    vertex(138.2734375, 130.9661407470703);
    vertex(142.9140625, 128.2630157470703);
    vertex(149.77734375, 124.90754699707031);
    vertex(158.86328125, 120.89973449707031);
    vertex(166.7890625, 117.56770324707031);
    vertex(173.5546875, 114.91145324707031);
    vertex(185.828125, 110.97395324707031);
    vertex(194.71875, 108.36457824707031);
    vertex(216.75, 103.23957824707031);
    endShape();
    game.invaderArt = get(60, 100, 315, 180);
    clear();
}

/**
 * Setup the game before drawing to the screen.
 */
function setup() {
    createCanvas(400, 400);
    // Initialize important game components
    initInvaderArt();
    initBackground();
    reset();
}

/**
 * Reset the game
 */
function reset() {
    // Make sure everything is empty
    game.bullets = [];
    game.invaders = [];
    game.bombs = [];
    game.particles = [];
    game.gun = new gunObj(200);
    for (var i = 0; i < 2; i++) {
        game.bullets.push(new bulletObj());
    }
    // Initialize space invaders in default starting position
    var a = 100;
    var b = 20;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 5; j++) {
            game.invaders.push(new invaderObj(a, b));
            game.bombs.push(new bombObj());
            a += 50;
        }
        a = 100;
        b += 50;
    }
}

/**
 * Draws the menu screen
 */
function drawMenu() {
    fill(0, 150, 0);
    rect(150, 215, 100, 50);
    fill(255);
    textSize(30);
    text("Start", 167, 250);
}

/**
 * Draw the game to the screen
 */
function drawGame() {
    // Draw the particles
    drawParticles();
    // Draw the invaders and bombs
    for (let i = 0; i < game.invaders.length; i++) {
        game.invaders[i].draw();
        game.invaders[i].move();
        // Draw bombs that have been dropped
        if (game.bombs[i].dropped === 1) {
            game.bombs[i].draw();
        }
    }
    // Draw the gun and check if the player is firing
    game.gun.draw();
    game.gun.move();
    checkFire();
    // Draw the bullets to the screen
    for (let i = 0; i < game.bullets.length; i++) {
        if (game.bullets[i].fire === 1) {
            game.bullets[i].draw();
        }
    }
}

/**
 * Draws all the particles to the screen
 */
function drawParticles() {
    // Draw particles to the screen
    for (let i = 0; i < game.particles.length; i++) {
        // Only draw visible particles
        if (game.particles[i].timer > 0) {
            game.particles[i].draw();
        } else {
            // Otherwise delete the particle
            game.particles.splice(i, 1);
            // Modifying while iterating is bad practice, but we can
            // get away with it if we decrement i
            i--;
        }
    }
}

/**
 * Draws the game over message to the screen
 */
function drawGameOver() {
    drawParticles();
    fill(255, 0, 0);
    textSize(40);
    text("Game Over", 100, 200);
    textSize(25);
    text("Click to restart", 120, 250);
}

/**
 * Draws the win message to the screen
 */
function drawWinScreen() {
    drawParticles();
    fill(255, 0, 0);
    textSize(40);
    text("You Win!", 120, 200);
    textSize(25);
    text("Click to restart", 120, 250);
}

/**
 * Procedurally generate the background image
 */
function initBackground() {
    for (var i = 0; i < height; i += 2) {
        for (var j = 0; j < width; j += 2) {
            if (random(0, 1000) < 1) {
                game.stars.push({
                    x: j,
                    y: i,
                    color: randomInt(1, 6), // Random color
                    blink: randomInt(0, 60), // Random blink state
                    speed: random(1, 3), // Random speed
                });
            }
        }
    }
}

/**
 * Draw the background to the screen
 */
function drawBackground() {
    // Black background
    background(0);
    noStroke();
    for (var i = 0; i < game.stars.length; i++) {
        // Get the rgb value from the color as binary
        r = 255 * (game.stars[i].color >>> 2);
        g = 255 * ((game.stars[i].color >>> 1) & 1);
        b = 255 * (game.stars[i].color & 1);
        // Blink the stars every 0.5 seconds
        if (game.stars[i].blink > 30) {
            fill(0);
        } else {
            fill(r, g, b);
        }
        // Draw the star to the screen
        rect(game.stars[i].x, game.stars[i].y, 2, 2);
        // Move the stars downward at their randomly assigned speed
        game.stars[i].y += game.stars[i].speed;
        // Move the star back to the top of the screen from the bottom
        if (game.stars[i].y > 400) {
            game.stars[i].y = 0;
        }
        // Cyclically update the stars blinking
        game.stars[i].blink++;
        if (game.stars[i].blink > 60) {
            game.stars[i].blink = 0;
        }
    }
}

// Source: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Main draw loop for drawing the current game state
 */
function draw() {
    // Draw the background first
    drawBackground();
    // Draw whichever game state we are in
    if (game.currentGameState === gameStates.Menu) {
        drawMenu();
    } else if (game.currentGameState === gameStates.Game) {
        drawGame();
    } else if (game.currentGameState === gameStates.GameOver) {
        drawGameOver();
    } else if (game.currentGameState === gameStates.WinScreen) {
        drawWinScreen();
    }
}
