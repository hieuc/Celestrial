class Oryx {
    constructor(game, x, y, radius, offset) {
        Object.assign(this, { game, x, y, radius, offset});

        this.center = { x: this.x, y: this.y};

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/objects.png");
        this.animsheet = ASSET_MANAGER.getAsset("./sprites/oryx.png");

        this.scale = 4;

        this.speed = 1.8;

        this.velocity = { x : 0, y : 0};

        this.animations = [];

        this.action = 0;

        this.bound = new BoundingCircle(this.x, this.y, 6 * this.scale);

        this.timestamp = Date.now();

        this.beam = null;

        this.portalspawned = false;

        this.movedout = false;

        this.movedin = false;

        this.end = false;

        this.finalcount = 0;

        this.loadAnimations();

        
    }

    loadAnimations() {
        // intro loop
        this.animations[0] = new Animator(this.spritesheet, 0, 192, 32, 32, 5, 1, 0, false, true);
        
        // intro
        this.animations[1] = new Animator(this.spritesheet, 0, 192, 32, 32, 14, 1, 0, false, false);

        // idle
        this.animations[2] = new Animator(this.animsheet, 0, 0, 32, 32, 1, 1, 0, false, true);

        // sword slam
        this.animations[3] = new Animator(this.animsheet, 0, 192, 32, 32, 3, 0.5, 0, false, false);
        
        // tornado 
        this.animations[4] = new Animator(this.spritesheet, 288, 128, 32, 32, 4, 0.2, 0, false, true);

        // "staggered"
        this.animations[5] = new Animator(this.spritesheet, 64, 0, 32, 32, 1, 1, 0, false, true);

        // idle exalted
        this.animations[6] = new Animator(this.animsheet, 0, 32, 32, 32, 3, 1, 0, false, true);

        // tornado transition
        this.animations[7] = new Animator(this.spritesheet, 224, 128, 32, 32, 2, 1, 0, false, true);

        // exalt staggered
        this.animations[8] = new Animator(this.spritesheet, 96, 0, 32, 32, 1, 1, 0, false, true);

        // sword raise
        this.animations[9] = new Animator(this.animsheet, 0, 480, 32, 32, 1, 1, 0, false, false);
    }

    update() {
        this.updateAnim();
    }

    updateAnim() {
        if (this.action === 0 && Date.now() - this.timestamp > 10000) {
            this.action = 1;
        } else if (this.action === 1 && this.animations[1].currentFrame() === 12) {
            this.throwWine();
            this.throwWine = function () {};
        } else if (this.action === 1 && this.animations[1].isAlmostDone(this.game.clockTick)) {
            this.action = 2;
            this.timestamp = Date.now();
        } else if (this.action === 2 && !this.portalspawned && Date.now() - this.timestamp > 9200) {
            this.action = 9;
            // spawn portals
            this.spawnPortals();
        } else if (this.action === 9 && this.animations[9].isAlmostDone(this.game.clockTick)) {
            this.action = 2;
            this.timestamp = Date.now();
        } else if (this.action === 2 && this.portalspawned && Date.now() - this.timestamp > 20000) {
            this.action = 3;
        } else if (this.action === 3 && this.animations[3].isAlmostDone(this.game.clockTick)) {
            // spawn beams
            for (var i = 0; i < 20; i++) {
                var r = 580 * Math.sqrt(Math.random());
                var theta = Math.random() * 2 * Math.PI;
    
                var dx = r * Math.cos(theta);
                var dy = r * Math.sin(theta); 
                this.game.addProjectile(new Beam(this.game, 624 + dx, 624 + dy));
            }
            this.beam = new Beam(this.game, 624, 624)
            this.game.addEntity(this.beam);
            // set timer for more beams
            this.beaminterval = setInterval(() => {
                for (var i = 0; i < 20; i++) {
                    var r = 580 * Math.sqrt(Math.random());
                    var theta = Math.random() * 2 * Math.PI;
        
                    var dx = r * Math.cos(theta);
                    var dy = r * Math.sin(theta); 
                    this.game.addProjectile(new Beam(this.game, 624 + dx, 624 + dy));
                }
            }, 2750);
            this.action = 5;
        } else if (this.beam !== null && this.beam.animation.currentFrame() > 11) {
            this.beam = null;
            this.action = 6;
            this.timestamp = Date.now();
        } else if (this.action === 6 && Date.now() - this.timestamp > 20000) {
            this.action = 7;
        } else if (this.action === 7 && this.animations[7].isAlmostDone(this.game.clockTick)) {
            this.action = 4;
            this.timestamp = Date.now();
        } else if (this.action === 4 && !this.movedout ) {
            this.moveOut();
        } else if (this.movedout && !this.movedin && (Date.now() - this.timestamp) / 1000 * this.speed - this.offset > Math.PI * 11) {
            clearInterval(this.interval);
            var that= this;
            // move in
            this.update = function () {
                if (that.x < 624)
                    that.x += 5;
                else {
                    this.movedin = true;
                }
                this.updateBound();
                this.updateAnim();
            } 
        } else if (this.movedin && !this.end) {
            var that = this;

            // wiggle around
            this.update = function () {
                that.x += randomInt(5) - 2;
                that.y += randomInt(5) - 2;
                this.updateBound();
                this.updateAnim();
            } 

            // final attack
            var pattern = function() {
                var n = 8;
                for (var i = 0; i < n; i++) {
                    var velocity = that.calculateVel(Math.PI / n * (i + Math.random()) * 2);
                    for (var j = 0; j < 3; j++) {
                        var pp = { spritesheet : ASSET_MANAGER.getAsset("./sprites/projectiles.png"),
                                sx: (j + 6) * 16, sy: 432};
                        var p = new Projectiles(that.game, that.x - 16, that.y - 16, velocity, 5.5 - j, 4500, false, pp);
                        that.game.addProjectile(p);
                    }
                }
                that.finalcount ++;
                console.log("incrementing final count " + that.finalcount);
            }

            this.interval = setInterval(pattern, 500);
            this.end = true;
        } else if (this.end && this.finalcount > 7) { 
            this.action = 8;
            clearInterval(this.beaminterval);
            clearInterval(this.interval);
            this.update = function () {};
            this.game.entities.filter(e => e instanceof Portal).forEach(e => clearInterval(e.interval));
            this.game.entities = this.game.entities.filter(e => !(e instanceof Portal));
        }
    }

    draw(ctx) {
        this.animations[this.action].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 16 * this.scale, 
            this.y - this.game.camera.y - 25 * this.scale, this.scale, -this.game.camera.rotation);
        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.center.x - this.game.camera.x, this.center.y - this.game.camera.y, this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            this.bound.draw(this.game, ctx);
            ctx.fillRect(this.center.x - this.game.camera.x - 5, this.center.y - this.game.camera.y - 5, 10, 10);
        }
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

    async attackCelestrial() {
        var that = this;
        clearInterval(this.interval);

        this.update = function() {
            var dx = Math.cos(-(Date.now() - that.timestamp) / 1000 * that.speed - that.offset) * that.radius;
            var dy = Math.sin(-(Date.now() - that.timestamp) / 1000 * that.speed - that.offset) * that.radius;

            that.x = that.center.x + dx;
            that.y = that.center.y + dy;

            that.updateBound();
            that.updateAnim();
        }

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

    moveOut() {
        var that = this;

        this.update = function() {
            

            that.x += 5;
            if (that.x >= that.center.x + that.radius) {
                that.movedout = true;
                that.timestamp = Date.now();
                that.attackCelestrial();
                console.log("woooo");
            }

            that.updateBound();
            that.updateAnim();
        }
    }

    throwWine() {
        var pp = { spritesheet : ASSET_MANAGER.getAsset("./sprites/wine.png"), 
                    sx : 0, sy : 0};

        var dx = this.game.camera.char.x - this.x - 8 * this.scale;
        var dy = this.game.camera.char.y - this.y + 16 * this.scale;

        var mag = Math.sqrt(dx * dx + dy * dy);

        var v = { x : dx / mag, y: dy / mag};

        var p = new Projectiles(this.game, this.x + 8 * this.scale, this.y - 16 * this.scale, v, 3, 10000, false, pp);
        p.scale = 4;
        p.updateSpriteSize(8);
        p.animations = new Animator(pp.spritesheet, pp.sx, pp.sy, 8, 8, 4, 0.15, 0, false, true);
        p.spin = true;
        this.game.addProjectile(p);
    }

    spawnPortals() {
        this.game.addEntity(new Portal(this.game, 624, 624, 520, 0));
        this.game.addEntity(new Portal(this.game, 624, 624, 520, Math.PI / 2));
        this.game.addEntity(new Portal(this.game, 624, 624, 520, Math.PI));
        this.game.addEntity(new Portal(this.game, 624, 624, 520, Math.PI * 1.5));
        this.portalspawned = true;
    }
}