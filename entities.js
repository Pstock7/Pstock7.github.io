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
        this.startShootProjectileFrame = 0;
        this.armMovement = 0;
        this.armVelocity = 0.5;
        this.attackStrength = 1;
        this.health = 1;
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

        if (game.keyArray['A'.charCodeAt(0)] === 1 && this.position.x > this.size / 2) {
            movement.x -= 1;
        }
        if (game.keyArray['D'.charCodeAt(0)] === 1 && this.position.x < width - this.size / 2) {
            movement.x += 1;
        }
        if (game.keyArray['W'.charCodeAt(0)] === 1 && this.position.y > this.size / 2) {
            movement.y -= 1;
        }
        if (game.keyArray['S'.charCodeAt(0)] === 1 && this.position.y < width - this.size / 2) {
            movement.y += 1;
        }
        // Make the direction of the player where the mouse is
        this.direction = createVector(mouseX - this.position.x, mouseY - this.position.y).heading()
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

        let framesSinceLastAttack = frameCount - this.startAttackFrame;
        if (mouseIsPressed && mouseButton === LEFT && framesSinceLastAttack > 30 || [10, 20].includes(framesSinceLastAttack)) {
            this.attack();
        }

        let framesSinceLastShot = frameCount - this.startShootProjectileFrame;
        if (mouseIsPressed && mouseButton === RIGHT && framesSinceLastShot > 60) {
            this.shoot();
        }
    }

    attack() {
        // Detect enemies and call their respective damage functions
        for (let i = 0; i < game.enemies.length; i++) {
            let vectorToEnemy = new p5.Vector(game.enemies[i].position.x - this.position.x, game.enemies[i].position.y - this.position.y);
            let angleToEnemy = vectorToEnemy.angleBetween(new p5.Vector(cos(this.direction), sin(this.direction)));
            if (vectorToEnemy.mag() <= game.enemies[i].size / 2 + 37
                && angleToEnemy >= -HALF_PI && angleToEnemy <= HALF_PI) {
                game.enemies[i].damage(this.attackStrength, this.position);
            }
        }
        // Spawn sword particle and reset frame timer
        if (frameCount - this.startAttackFrame > 30) {
            game.particles.unshift(new SwordParticle(this.position.x, this.position.y, this.direction));
            this.startAttackFrame = frameCount;
        }
    }

    shoot() {
        // Shoot an arrow
        game.particles.unshift(new ArrowParticle(this.position.x, this.position.y, this.direction));
        this.startShootProjectileFrame = frameCount;
    }

    damage(enemy) {
        this.health -= enemy.attackStrength;
    }
}

class Slime {
    constructor(x, y, health) {
        this.position = new p5.Vector(x, y);
        this.direction = random(0, TWO_PI);
        this.speed = 1.5;
        this.size = 20;
        this.health = health;
        this.initialHealth = health;
        this.currentState = this.wander;
        this.knockbackVector = new p5.Vector(0, 0);
        this.currentFrameCount = 0;
        this.attackStrength = 1;
        this.primaryColor = color(0, 220, 0);
        this.secondaryColor = color(0, 160, 0);
        this.damagePrimaryColor = color(220, 50, 0);
        this.damageSecondaryColor = color(160, 50, 0);
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.direction);
        noStroke();
        // Body
        if (this.currentState === this.knockback) {
            fill(this.damagePrimaryColor);
        } else {
            fill(this.primaryColor);
        }
        ellipse(0, 0, this.size, this.size);
        if (this.currentState === this.knockback) {
            fill(this.damageSecondaryColor);
        } else {
            fill(this.secondaryColor);
        }
        ellipse(0, 0, this.size * 0.75, this.size * 0.75);
        // Eyes
        fill(0);
        ellipse(this.size * 7 / 20, this.size * 3.5 / 20, this.size / 5, this.size / 5);
        ellipse(this.size * 7 / 20, -this.size * 3.5 / 20, this.size / 5, this.size / 5);
        // Health bar
        rotate(-this.direction);
        fill(220, 0, 0);
        rect(-this.size / 2, -this.size / 2 - 15, this.size, 5);
        fill(0, 220, 0);
        rect(-this.size / 2, -this.size / 2 - 15, this.size * this.health / this.initialHealth, 5);
        pop();
    }

    update() {
        this.currentState();
        this.currentFrameCount++;
        if (this.position.dist(game.player.position) < this.size / 2 + game.player.size / 2) {
            game.player.damage(this);
        }
    }

    wander() {
        let relativeFrame = this.currentFrameCount % 90;
        if (relativeFrame === 0) {
            this.direction = random(0, TWO_PI);
            game.particles.unshift(new SlimeParticle(this.position.x, this.position.y, this.size));
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

    damage(inflictedDamage, knockbackPosition) {
        if (this.currentState === this.knockback) return;
        this.health -= inflictedDamage;
        this.knockbackVector.set(this.position.x - knockbackPosition.x, this.position.y - knockbackPosition.y);
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

class BigSlime extends Slime {
    constructor(x, y, health) {
        super(x, y, health);
        this.size = 40;
    }
}

class BossSlime extends Slime {

    constructor(x, y, health) {
        super(x, y, health);
        this.size = 80;
    }
}

class Zombie extends Slime {
    constructor(x, y, health) {
        super(x, y, health);
        this.speed = 1;
        this.primaryColor = color(60, 160, 140);
        this.secondaryColor = color(30, 110, 95);
        this.damagePrimaryColor = color(220, 50, 0);
        this.damageSecondaryColor = color(160, 50, 0);
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.direction);
        noStroke();
        // Outer body
        if (this.currentState === this.knockback) {
            fill(this.damagePrimaryColor);
        } else {
            fill(this.primaryColor);
        }
        ellipse(0, 0, this.size, this.size);
        // Arms
        rect(this.size / 4, this.size / 4, this.size / 2.5, this.size / 2.5);
        rect(this.size / 4, -this.size / 4 - this.size / 2.5, this.size / 2.5, this.size / 2.5);
        // Inner body
        if (this.currentState === this.knockback) {
            fill(this.damageSecondaryColor);
        } else {
            fill(this.secondaryColor);
        }
        ellipse(0, 0, this.size * 0.75, this.size * 0.75);
        // Eyes
        fill(0);
        ellipse(this.size * 7 / 20, this.size * 3.5 / 20, this.size / 5, this.size / 5);
        ellipse(this.size * 7 / 20, -this.size * 3.5 / 20, this.size / 5, this.size / 5);
        // Health bar
        rotate(-this.direction);
        fill(220, 0, 0);
        rect(-this.size / 2, -this.size / 2 - 15, this.size, 5);
        fill(0, 220, 0);
        rect(-this.size / 2, -this.size / 2 - 15, this.size * this.health / this.initialHealth, 5);
        pop();
    }

    update() {
        if (this.currentState !== this.knockback && this.position.dist(game.player.position) < 100) {
            this.currentState = this.chase;
        }
        this.currentState();
        this.currentFrameCount++;
        if (this.position.dist(game.player.position) < this.size / 2 + game.player.size / 2) {
            game.player.damage(this);
        }
    }

    wander() {
        let relativeFrame = this.currentFrameCount % 90;
        if (relativeFrame === 0) {
            this.direction = random(0, TWO_PI);
        } else if (relativeFrame <= 30) {
            this.position.x += this.speed * cos(this.direction)
            this.position.y += this.speed * sin(this.direction)
            this.moveBackInbounds();
        }
    }

    chase() {
        let vectorToPlayer = p5.Vector.sub(game.player.position, this.position);
        if (vectorToPlayer.mag() >= 100) {
            this.currentState = this.wander;
        }
        vectorToPlayer.normalize();
        vectorToPlayer.mult(this.speed);

        this.position.add(vectorToPlayer);
        this.direction = vectorToPlayer.heading();
        this.moveBackInbounds();
    }
}
