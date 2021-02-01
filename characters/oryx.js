class Oryx {
    constructor(game, x, y, radius, offset) {
        Object.assign(this, { game, x, y, radius, offset});

        this.center = { x: this.x, y: this.y};

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/objects.png");

        this.scale = 4;

        this.speed = 1.8;

        this.velocity = { x : 0, y : 0};

        this.animations = [];

        this.bound = new BoundingCircle(this.x, this.y, 6 * this.scale);

        this.timestamp = Date.now();

        this.loadAnimations();

        this.attack();
    }

    loadAnimations() {
        // tornado 
        this.animations = new Animator(this.spritesheet, 288, 128, 32, 32, 4, 0.2, 0, false, true);
    }

    update() {
        var dx = Math.cos(-(Date.now() - this.timestamp) / 1000 * this.speed - this.offset) * this.radius;
        var dy = Math.sin(-(Date.now() - this.timestamp) / 1000 * this.speed - this.offset) * this.radius;

        this.x = this.center.x + dx;
        this.y = this.center.y + dy;

        this.updateBound();
    }

    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 18 * this.scale, 
            this.y - this.game.camera.y - 28 * this.scale, this.scale);
        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.center.x - this.game.camera.x, this.center.y - this.game.camera.y, this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, this.bound.r, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.fillRect(this.center.x - this.game.camera.x - 5, this.center.y - this.game.camera.y - 5, 10, 10);
        }
    }

    async attack() {
        var that = this;
        clearInterval(this.interval);
        await sleep(2500);
        
        var pattern = async function () {
            var n = 8;
            for (var i = 0; i < n; i++) {
                var velocity = that.calculateVel(Math.PI / n * i * 2);
                for (var j = 0; j < 3; j++) {
                    var pp = { spritesheet : ASSET_MANAGER.getAsset("./sprites/projectiles.png"),
                            sx: (j + 6) * 16, sy: 432};
                    var p = new Projectiles(that.game, that.x - 16, that.y - 16, velocity, 5.5 - j, 4500, false, pp);
                    that.game.addProjectile(p);
                }
            }
        }

        this.interval = setInterval(pattern, 550);
        
    }

    updateBound() {
        this.bound.x = this.x;
        this.bound.y = this.y - 2 * this.scale;
    }

    /**
     * Return x and y velocity based on shooting angle
     * 
     * @param {*} angle in radians
     */
    calculateVel (angle) {
        var v = { x: Math.cos(angle),
                    y: Math.sin(angle)};
        
        return v;
    }
}