/**
 * This file contains code for managing particles
 */

let inverseSqrt2 = 0.707; // Approximation for 1 / sqrt(2)

/**
 * This class defines a slime particle
 */
class SlimeParticle {
    constructor(x, y) {
        this.position = new p5.Vector(x, y);
        this.timer = 180;
        this.size = 20;
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
        // Hijack the player's position to keep the particle with the player
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

class RainParticle {
    constructor() {
        this.position = new p5.Vector(random(0, width), random(0, height));
        this.timer = 1;
        this.size = 1.5;
        this.velocity = new p5.Vector(random(2, 3), HALF_PI - 0.5 + random(-0.1, 0.1));
    }

    draw() {
        fill(40, 80, 200);
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