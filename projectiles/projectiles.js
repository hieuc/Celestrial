class Projectiles {
    constructor(game, x, y, velocity, speed, lifetime, friendly, custom) {
        Object.assign(this, { game, x, y, velocity, speed, lifetime, friendly});

        // if no spritesheet provided, use default
        if (custom) {
            this.property = custom
        } else {
            this.property = PARAMS.default_projectile;
        }

        this.bound = new BoundingCircle(this.x, this.y, 16);

        this.scale = 2.5;

        this.rotatedSprite = this.rotate(Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
        
        this.timestamp = Date.now();
    }

    loadAnimations() {

    }

    update() {
        // if lifetime expired
        if (Date.now() - this.timestamp > this.lifetime)
            this.removeFromWorld = true;
        else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();
        this.checkCollision();
    }

    updateBound() {
        this.bound.x = this.x + 8 * this.scale;
        this.bound.y = this.y + 8 * this.scale;
    }

    draw(ctx) {
        //ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
        //this.rotate(ctx, Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
        ctx.drawImage(this.rotatedSprite, this.x - this.game.camera.x, this.y - this.game.camera.y, 16 * this.scale, 16 * this.scale);
        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, this.bound.r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    rotate(angle) {
        var c2 = document.createElement("canvas");
        c2.width = 16 * this.scale;
        c2.height = 16 * this.scale;
        var ctx2 = c2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.save();
        ctx2.translate(16 * this.scale / 2, 16 * this.scale / 2);
        ctx2.rotate(angle);
        ctx2.translate(-16 * this.scale / 2, -16 * this.scale / 2);
        ctx2.drawImage(this.property.spritesheet, this.property.sx, this.property.sy, 16, 16, 0, 0, 16 * this.scale, 16 * this.scale);

        return c2;
    }

    checkCollision() {
        var that = this;
        this.game.entities.forEach(e => {
            if (e.bound && that.bound.collide(e.bound)) {
                if (e instanceof Obstacles) {
                    that.removeFromWorld = true;
                } else if (e instanceof Wizard && !that.friendly) {
                    // do dmg here
                    that.removeFromWorld = true;
                }
            }
        })
    }
}