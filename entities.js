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
        this.attackStrength = 1;
        this.health = 5;
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

        if (game.keyArray["Z".charCodeAt(0)] === 1) {
            this.attack();
        }
    }

    attack() {
        if (frameCount - this.startAttackFrame > 30) {
            // Detect enemies and call their respective damage functions
            for (let i = 0; i < game.enemies.length; i++) {
                let vectorToEnemy = new p5.Vector(game.enemies[i].position.x - this.position.x, game.enemies[i].position.y - this.position.y);
                let angleToEnemy = vectorToEnemy.angleBetween(new p5.Vector(cos(this.direction), sin(this.direction)));
                if (vectorToEnemy.mag() <= game.enemies[i].size / 2 + 37
                    && angleToEnemy >= -HALF_PI && angleToEnemy <= HALF_PI) {
                    game.enemies[i].damage(this.attackStrength);
                }
            }
            game.particles.unshift(new SwordParticle(this.position.x, this.position.y, this.direction));
            this.startAttackFrame = frameCount;
        }
    }

    damage(enemy) {
        this.health -= enemy.attackStrength;
    }
}

class Slime {
    constructor(x, y) {
        this.position = new p5.Vector(x, y);
        this.direction = random(0, TWO_PI);
        this.speed = 2;
        this.size = 20;
        this.health = 5;
        this.currentState = this.wander;
        this.knockbackVector = new p5.Vector(0, 0);
        this.currentFrameCount = 0;
        this.attackStrength = 1;
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
        this.currentState();
        this.currentFrameCount++;
        if (this.position.dist(game.player.position) <= 20) {
            game.player.damage(this);
        }
    }

    wander() {
        let relativeFrame = this.currentFrameCount % 90;
        if (relativeFrame === 0) {
            this.direction = random(0, TWO_PI);
            game.particles.unshift(new SlimeParticle(this.position.x, this.position.y));
        } else if (relativeFrame <= 30) {
            this.position.x += this.speed * cos(this.direction)
            this.position.y += this.speed * sin(this.direction)
            this.moveBackInbounds();
        }
    }

    knockback() {
        if (this.currentFrameCount === 30) {
            this.currentState = this.wander;
        }
        this.position.add(this.knockbackVector);
        this.moveBackInbounds();
    }

    damage(inflictedDamage) {
        this.health -= inflictedDamage;
        this.knockbackVector.set(this.position.x - game.player.position.x, this.position.y - game.player.position.y);
        this.knockbackVector.normalize();
        this.knockbackVector.mult(this.speed);
        this.currentState = this.knockback;
        this.currentFrameCount = 0;
    }

    moveBackInbounds() {
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