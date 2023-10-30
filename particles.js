/**
 * This file contains code for managing particles
 */

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