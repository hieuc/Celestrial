class Beam {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/beam.png");

        this.animation = new Animator(this.spritesheet, 0, 0, 160, 160, 16, 0.06, 0, false, false);
        this.scale = 0.8;
        this.phase = 0; // 0 = pre-landing, 1 = landing
        this.bound = new BoundingCircle(this.x, this.y, 0);

        this.pretime = 1200;
        this.timestamp = Date.now();
    }

    update() {
        if (this.phase === 0 && Date.now() - this.timestamp >= this.pretime)
            this.phase = 1;
        else if (this.phase === 1) {
            if (this.animation.isDone() ) {
                this.removeFromWorld = true;
            } else if (this.animation.currentFrame() > 8) {
                this.bound.r = 0;
            } else if (this.animation.currentFrame() > 3) {
                this.bound.r = 40 * this.scale;
            }
        }
            
    }

    draw(ctx) {
        if (this.phase === 0) {
            ctx.strokeStyle = '#ff4545';
            ctx.beginPath();
            ctx.arc(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, 40 * this.scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();

            var closingRadius = 40 * this.scale *(1 - (Date.now() - this.timestamp) / this.pretime);
            if (closingRadius > 0) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.beginPath();
                ctx.arc(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, 
                    closingRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            var p = this.getP(this.x - 80 * this.scale, this.y - 130 * this.scale);
            
            this.animation.drawFrame(this.game.clockTick, ctx, this.x - 80 * this.scale - this.game.camera.x, 
                this.y - 130 * this.scale - this.game.camera.y, this.scale, -this.game.camera.rotation);

            
        }
        if (PARAMS.debug) {
            this.bound.draw(this.game, ctx);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x - this.game.camera.x - 5, this.y - this.game.camera.y - 5, 10, 10);
        }
    }

    getP(x, y) {
        var o = 560;
        var p = {};
        x-= o ;
        y-= o ;
        p.x = x * Math.cos(this.game.camera.rotation) + y * Math.sin(this.game.camera.rotation);
        p.y = -x * Math.sin(this.game.camera.rotation) + y * Math.cos(this.game.camera.rotation);
        p.x -= this.game.camera.x - o ;
        p.y -= this.game.camera.y - o ;
        return p;
    }
}