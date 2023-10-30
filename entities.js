/**
 * This file contains code for managing entities
 */

/**
 * Defines the player character and all related functionality
 */
class Player {
    constructor(x, y) {
        this.position = new p5.Vector(x, y);
        this.direction = 0;
        this.speed = 2;
        this.size = 20;
        this.startAttackFrame = 0;
        this.armMovement = 0;
        this.armVelocity = 0.5;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.direction);
        noStroke();
        fill(150);
        // Arms
        rect(-3.5 + this.armMovement, 9, 7, 7);
        rect(-3.5 - this.armMovement, -16, 7, 7);
        // Head
        ellipse(0, 0, this.size, this.size);
        fill(100);
        ellipse(0, 0, this.size - 5, this.size - 5);
        fill(0);
        // Slits in helmet
        rect(3, 1.5, 6, 3);
        rect(3, -4.5, 6, 3);
        fill(200, 0, 0);
        // Feather plume
        ellipse(-this.size / 3, 0, this.size / 1.5, this.size / 4);
        pop();
    }

    control() {
        // Make a vector to hold the movement
        let movement = new p5.Vector(0, 0);

        if (game.keyArray[LEFT_ARROW] === 1 && this.position.x > this.size / 2) {
            movement.x -= 1;
            this.direction = PI;
        }
        if (game.keyArray[RIGHT_ARROW] === 1 && this.position.x < width - this.size / 2) {
            movement.x += 1;
            this.direction = 0;
        }
        if (game.keyArray[UP_ARROW] === 1 && this.position.y > this.size / 2) {
            movement.y -= 1;
            this.direction = -HALF_PI;
        }
        if (game.keyArray[DOWN_ARROW] === 1 && this.position.y < width - this.size / 2) {
            movement.y += 1;
            this.direction = HALF_PI;
        }
        if (game.keyArray[LEFT_ARROW] === 1 && game.keyArray[DOWN_ARROW] === 1) {
            this.direction = HALF_PI + QUARTER_PI;
        }
        if (game.keyArray[RIGHT_ARROW] === 1 && game.keyArray[DOWN_ARROW] === 1) {
            this.direction = QUARTER_PI;
        }
        if (game.keyArray[LEFT_ARROW] === 1 && game.keyArray[UP_ARROW] === 1) {
            this.direction = PI + QUARTER_PI;
        }
        if (game.keyArray[RIGHT_ARROW] === 1 && game.keyArray[UP_ARROW] === 1) {
            this.direction = -QUARTER_PI;
        }
        // Make sure the player's speed is always the same (even on the diagonals)
        movement.normalize();
        movement.mult(this.speed);
        // Move the player
        this.position.add(movement);

        if (movement.mag() > 0) {
            // Update arm movement
            if (this.armMovement >= 5) {
                this.armVelocity = -0.5;
            } else if (this.armMovement <= -5) {
                this.armVelocity = 0.5;
            }
            this.armMovement += this.armVelocity;
        }

        if (game.keyArray["z".charCodeAt(0)] === 1) {
            this.attack();
        }
    }

    attack() {
        // TODO: Check using startAttackFrame whether attack is over. Need to come up with animation
    }
}

class Slime {
    constructor(x, y) {
        this.position = new p5.Vector(x, y);
        this.direction = random(0, TWO_PI);
        this.speed = 2;
        this.size = 20;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.direction);
        noStroke();
        // Body
        fill(0, 220, 0);
        ellipse(0, 0, this.size, this.size);
        fill(0, 160, 0);
        ellipse(0, 0, this.size - 5, this.size - 5);
        // Eyes
        fill(0);
        ellipse(7, 3.5, 4, 4);
        ellipse(7, -3.5, 4, 4);
        pop();
    }

    update() {
        let relativeFrame = frameCount % 90;
        if (relativeFrame === 0) {
            this.direction = random(0, TWO_PI);
            game.particles.unshift(new SlimeParticle(this.position.x, this.position.y));
        } else if (relativeFrame <= 30) {
            this.position.x += this.speed * cos(this.direction)
            this.position.y += this.speed * sin(this.direction)
            if (this.position.x < this.size / 2) {
                this.position.x = this.size / 2;
            } else if (this.position.x > width - this.size / 2) {
                this.position.x = width - this.size / 2;
            }
            if (this.position.y < this.size / 2) {
                this.position.y = this.size / 2;
            } else if (this.position.y > height - this.size / 2) {
                this.position.y = height - this.size / 2;
            }
        }
    }
}