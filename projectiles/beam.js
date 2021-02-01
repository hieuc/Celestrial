class Beam {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/beam.png");

        this.animation = new Animator(this.spritesheet, 0, 0, 80, 160, 16, 0.06, 0, false, false);
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
            var elapsed = Date.now() - this.timestamp - this.pretime;
            if (this.animation.isDone() ) {
                this.removeFromWorld = true;
            } else if (elapsed > 480) {
                this.bound.r = 0;
            } else if (elapsed > 120) {
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
        } else 
            this.animation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 40 * this.scale, 
                this.y - this.game.camera.y - 130 * this.scale, this.scale)

        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, this.bound.r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }
}