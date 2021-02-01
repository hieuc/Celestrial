class Portal {
    constructor(game, x, y, radius, offset) {
        Object.assign(this, { game, x, y, radius, offset});

        this.center = { x: this.x, y: this.y};

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/objects.png");

        this.scale = 4;

        this.speed = 0.85;

        this.velocity = { x : 0, y : 0};

        this.animations = [];

        this.timestamp = Date.now();

        this.loadAnimations();

        this.attack();
    }

    loadAnimations() {
        this.animations = new Animator(this.spritesheet, 0, 64, 32, 32, 5, 0.2, 0, false, true);
    }

    update() {
        var dx = Math.cos(-(Date.now() - this.timestamp) / 1000 * this.speed - this.offset) * this.radius;
        var dy = Math.sin(-(Date.now() - this.timestamp) / 1000 * this.speed - this.offset) * this.radius;

        this.x = this.center.x + dx;
        this.y = this.center.y + dy;
    }

    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 16 * this.scale, 
            this.y - this.game.camera.y - 16 * this.scale, this.scale);
        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.center.x - this.game.camera.x, this.center.y - this.game.camera.y, this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.fillRect(this.center.x - this.game.camera.x - 5, this.center.y - this.game.camera.y - 5, 10, 10);
        }
    }

    attack() {
        var that = this;
        clearInterval(this.interval);
        var pp = { spritesheet : ASSET_MANAGER.getAsset("./sprites/projectiles.png"),
                    sx: 48, sy: 96};
        
        var pattern = async function () {
            var n = 11;
            for (var i = 0; i < n; i++) {
                //var velocity = that.calculateVel(Math.PI / n * i * 2);
                var vel = {x: (that.center.x - that.x) / that.radius,
                                y: (that.center.y - that.y) / that.radius}; 

                var p = new Projectiles(that.game, that.x - 12, that.y - 12, vel, 2, 4500, false, pp);
                that.game.addProjectile(p);

                for (var j = -1; j < 2; j++) {
                    var cvel = {x : -vel.x, y : -vel.y};
                    // transform current location to pi/8
                    cvel.x = cvel.x * Math.cos(-Math.PI/8 * j) + cvel.y * Math.sin(-Math.PI/8 * j);
                    cvel.y = vel.x * Math.sin(-Math.PI/8 * j) + cvel.y * Math.cos(-Math.PI/8 * j);
                    var p = new Projectiles(that.game, that.x - 12, that.y - 12, cvel, 6, 200, false, pp);
                    that.game.addProjectile(p);
                }
                await sleep(165);
            }
        }

        this.interval = setInterval(pattern, 2150);
        
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