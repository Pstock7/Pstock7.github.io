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
