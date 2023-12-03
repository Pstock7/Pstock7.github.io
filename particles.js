/**
 * This file contains code for managing particles
 */

let inverseSqrt2 = 0.707; // Approximation for 1 / sqrt(2)

/**
 * This class defines a slime particle
 */
class SlimeParticle {
    constructor(x, y, size) {
        this.position = new p5.Vector(x, y);
        this.timer = 180;
        this.size = size;
    }

    draw() {
        fill(0, 220, 0, this.timer);
        ellipse(this.position.x, this.position.y, this.size, this.size);
        if (frameCount % 2 === 0) {
            this.timer--;
        }
    }
}

class SwordParticle {
    constructor(x, y, direction) {
        this.position = new p5.Vector(x, y);
        this.timer = 100;
        this.size = 75;
        this.halfSize = this.size / 2;
        this.direction = direction;
        this.arcEndpoint = this.halfSize * inverseSqrt2;
        this.swordAngle = HALF_PI;
    }

    draw() {
        // Retrieve the player's position to keep the particle with the player
        this.position = game.player.position;
        push();
        translate(this.position.x, this.position.y);
        rotate(this.direction);
        if (this.swordAngle <= 0) {
            fill(220, 220, 220, this.timer);
            arc(0, 0, this.size, this.size, -QUARTER_PI, QUARTER_PI, OPEN);
            triangle(15, -15, this.arcEndpoint, 0, this.arcEndpoint, -this.arcEndpoint);
        }
        if (this.swordAngle >= -HALF_PI) {
            push();
            fill(150);
            rotate(this.swordAngle);
            rect(0, -3, this.halfSize, 6);
            triangle(this.halfSize, -3, this.halfSize, 3, this.halfSize + 5, 0)
            this.swordAngle -= 0.15;
            pop();
        }
        pop();
        this.timer -= 5;
    }
}

class ArrowParticle {
    constructor(x, y, direction) {
        this.position = new p5.Vector(x, y);
        this.timer = 1;
        this.speed = 5;
        this.direction = direction;
        this.positionOffset = 10;
        this.arrowHeadOffset = 15;
    }

    draw() {
        push()
        translate(this.position.x, this.position.y);
        rotate(this.direction);
        // Arrow head
        fill(150);
        triangle(this.positionOffset + this.arrowHeadOffset + 6, 0, this.positionOffset + this.arrowHeadOffset, 4, this.positionOffset + this.arrowHeadOffset, -4);
        // Arrow shaft
        fill(85, 60, 20);
        rect(this.positionOffset, -1.5, this.arrowHeadOffset, 3);
        // Arrow fletching
        fill(200, 40, 40);
        quad(this.positionOffset, 1,
            this.positionOffset + 6, 1,
            this.positionOffset + 4, 4,
            this.positionOffset - 2, 4);
        quad(this.positionOffset, -1,
            this.positionOffset + 6, -1,
            this.positionOffset + 4, -4,
            this.positionOffset - 2, -4);
        pop();
        // Detect any collisions
        this.detectCollision();
        // Move arrow forward
        this.positionOffset += this.speed;
        // Delete projectiles that are off-screen
        if (this.positionOffset > 600) {
            this.timer = 0;
        }
    }

    detectCollision() {
        // Use x and y to get the global position of the arrow
        let x = p5.Vector.fromAngle(this.direction);
        let y = p5.Vector.fromAngle(this.direction + HALF_PI);

        // Get the positions of the corners and centroid in local coordinates
        let topLeftCorner = createVector(this.positionOffset - 2, -4);
        let topRightCorner = createVector(this.positionOffset + this.arrowHeadOffset + 6, -4);
        let bottomLeftCorner = createVector(this.positionOffset - 2, 4);
        let bottomRightCorner = createVector(this.positionOffset + this.arrowHeadOffset + 6, 4);
        let centroid = createVector(this.positionOffset + this.arrowHeadOffset / 2 + 3, 0);

        let pointsOnArrow = [centroid, topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner];

        // Translate to global coordinates
        for (let i = 0; i < pointsOnArrow.length; i++) {
            let globalVector = this.position.copy();
            globalVector.add(p5.Vector.mult(x, pointsOnArrow[i].x));
            globalVector.add(p5.Vector.mult(y, pointsOnArrow[i].y));
            pointsOnArrow[i] = globalVector;
        }

        // Detect a collision and damage the enemy
        for (let i = 0; i < game.enemies.length; i++) {
            // Do an initial check to avoid unnecessary computation
            if (pointsOnArrow[0].dist(game.enemies[i].position) < game.enemies[i].size / 2 + pointsOnArrow[0].dist(pointsOnArrow[1])) {
                for (let j = 0; j < pointsOnArrow.length; j++) {
                    if (pointsOnArrow[j].dist(game.enemies[i].position) < game.enemies[i].size / 2) {
                        // Damage the enemy
                        game.enemies[i].damage(game.player.attackStrength, pointsOnArrow[0]);
                        // Delete the arrow
                        this.timer = 0;
                        break;
                    }
                }
            }
        }
    }
}

class RainParticle {
    constructor() {
        this.position = new p5.Vector(random(0, width), random(0, height));
        this.timer = 1;
        this.size = 1.5;
        this.velocity = new p5.Vector(random(3, 5), HALF_PI - 0.5 + random(-0.1, 0.1));
    }

    draw() {
        fill(40, 90, 120);
        rect(this.position.x - this.size, this.position.y - 3 * this.size, 1.1 * this.size, 5 * this.size);
        rect(this.position.x, this.position.y - 2 * this.size, 1.1 * this.size, 4 * this.size);
        rect(this.position.x + this.size, this.position.y - this.size, 1.1 * this.size, 3 * this.size);
        this.position.x += this.velocity.x * cos(this.velocity.y);
        this.position.y += this.velocity.x * sin(this.velocity.y);
        if (this.position.x > width) {
            this.position.x = 0;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        }
    }
}