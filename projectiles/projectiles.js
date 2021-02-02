class Projectiles {
    constructor(game, x, y, velocity, speed, lifetime, friendly, custom) {
        Object.assign(this, { game, x, y, velocity, speed, lifetime, friendly});

        // if no spritesheet provided, use default
        if (custom) {
            this.property = custom;
        } else {
            this.property = PARAMS.default_projectile;
        }

        this.spriteSize = 16;

        this.bound = new BoundingCircle(this.x, this.y, this.spriteSize);

        this.spin = false;

        this.scale = 2.5;

        this.rotatedSprite = this.rotate(Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
        
        this.timestamp = Date.now();
    }

    loadAnimations() {

    }

    updateSpriteSize(size) {
        this.spriteSize = size;
        this.rotatedSprite = this.rotate(Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
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
        this.bound.x = this.x + this.spriteSize * this.scale / 2;
        this.bound.y = this.y + this.spriteSize * this.scale / 2;
    }

    draw(ctx) {
        //ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
        //this.rotate(ctx, Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
        if (!this.spin)
            ctx.drawImage(this.rotatedSprite, this.x - this.game.camera.x, this.y - this.game.camera.y, this.spriteSize * this.scale, this.spriteSize * this.scale);
        else
            this.animations.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, 
                this.y - this.game.camera.y, this.scale, -this.game.camera.rotation); 
        if (PARAMS.debug) {
            this.bound.draw(this.game, ctx);
        }
    }

    rotate(angle) {
        var c2 = document.createElement("canvas");
        c2.width = this.spriteSize * this.scale;
        c2.height = this.spriteSize * this.scale;
        var ctx2 = c2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.save();
        ctx2.translate(this.spriteSize * this.scale / 2, this.spriteSize * this.scale / 2);
        ctx2.rotate(angle);
        ctx2.translate(-this.spriteSize * this.scale / 2, -this.spriteSize * this.scale / 2);
        ctx2.drawImage(this.property.spritesheet, this.property.sx, this.property.sy, this.spriteSize, this.spriteSize, 0, 0, this.spriteSize * this.scale, this.spriteSize * this.scale);

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
                } else if (that.friendly && e instanceof Oryx) {
                    that.removeFromWorld = true;
                }
            }
        })
    }
}