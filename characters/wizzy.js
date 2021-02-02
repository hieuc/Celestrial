class Wizard {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/wizard.png");

        this.scale = 4;

        this.action = 0; // 0 = idle, 1 = run, 2 = attack

        this.face = 0; // 0 = right, 1 = left, 2 = down, 3 = up

        this.speed = 4;

        this.velocity = { x : 0, y : 0};

        this.bound = new BoundingCircle(this.x, this.y, 2.5 * this.scale);

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 3; i++) {
            this.animations[i] = [];
        }
        
        // idle 
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 8, 8, 1, 1, 0, false, true);
        this.animations[0][1] = new Animator(this.spritesheet, 0, 8, 8, 8, 1, 1, 0, false, true);
        this.animations[0][2] = new Animator(this.spritesheet, 0, 16, 8, 8, 1, 1, 0, false, true);
        this.animations[0][3] = new Animator(this.spritesheet, 0, 24, 8, 8, 1, 1, 0, false, true);

        // run
        this.animations[1][0] = new Animator(this.spritesheet, 0, 0, 8, 8, 2, 0.15, 0, false, true);
        this.animations[1][1] = new Animator(this.spritesheet, 0, 8, 8, 8, 2, 0.15, 0, false, true);
        this.animations[1][2] = new Animator(this.spritesheet, 0, 16, 8, 8, 3, 0.15, 0, false, true);
        this.animations[1][3] = new Animator(this.spritesheet, 0, 24, 8, 8, 3, 0.15, 0, false, true);

        // attack
        this.animations[2][0] = new Animator(this.spritesheet, 32, 0, 11, 8, 2, 0.1, 0, false, false);
        this.animations[2][1] = new Animator(this.spritesheet, 32, 8, 11, 8, 2, 0.1, 0, false, false);
        this.animations[2][2] = new Animator(this.spritesheet, 32, 16, 8, 8, 2, 0.1, 0, false, false);
        this.animations[2][3] = new Animator(this.spritesheet, 32, 24, 8, 8, 2, 0.1, 0, false, false);
    }

    update() {
        // movement
        var g = this.game;
        if (g.left && !g.right) {
            this.velocity.x = -1;
        } else if (g.right && !g.left) {
            this.velocity.x = 1;
        } else {
            this.velocity.x = 0;
        }

        if (g.up && !g.down) {
            this.velocity.y = -1;
        } else if (g.down && !g.up) {
            this.velocity.y = 1;
        } else {
            this.velocity.y = 0;
        }
        
        // animations
        if(this.action !== 2 || this.animations[this.action][this.face].isAlmostDone(this.game.clockTick)) {
            if (this.velocity.x !== 0 || this.velocity.y !== 0)
                this.action = 1;
            else 
                this.action = 0;
        }

        if (this.action !== 2) {
            if (this.velocity.x > 0)
                this.face = 0;
            else if (this.velocity.x < 0)
                this.face = 1;
            else if (this.velocity.y > 0)
                this.face = 2;
            else if (this.velocity.y < 0){
                this.face = 3;
            }
        }
        
        // position
        //this.handleCollision();
        this.x += this.velocity.x * this.speed * Math.cos(this.game.camera.rotation) 
                    + this.velocity.y * this.speed * Math.sin(this.game.camera.rotation);
        this.y += this.velocity.y * this.speed * Math.cos(this.game.camera.rotation)
                    - this.velocity.x * this.speed * Math.sin(this.game.camera.rotation);
        
        
        this.updateBound();
    }

    draw(ctx) {
        if (this.action === 2 && this.face === 1)
            this.animations[this.action][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 3 * this.scale, this.y - this.game.camera.y, this.scale, -this.game.camera.rotation);
        else 
            this.animations[this.action][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale, -this.game.camera.rotation);
        if (PARAMS.debug) {
            this.bound.draw(this.game, ctx);
        }
    }

    updateBound() {
        this.bound.x = this.x + 4 * this.scale;
        this.bound.y = this.y + 4 * this.scale;
    }

    startAttack(click) {
        this.action = 2;
        if (click.x - this.x  + this.game.camera.x + 12 * this.scale < 0)
            this.face = 1;
        else if (click.x - this.x  + this.game.camera.x - 17 * this.scale > 0)
            this.face = 0;
        else if (click.y - this.y  + this.game.camera.y - 5 * this.scale < 0)
            this.face = 3;
        else 
            this.face = 2;
        var velocity = this.calculateVel(click);
        var p = new Projectiles(this.game, this.x, this.y, velocity, 5, 2000, true);
        this.game.addProjectile(p);
        this.animations[this.action][this.face].elapsedTime = 0;
    }

    /**
     * Calculate x, y velocity towards a location such that x^2 + y^2 = 1 
     * 
     * @param {*} click 
     */
    calculateVel(click) {
        var dx = click.x - this.x + this.game.camera.x - 16;
        var dy = click.y - this.y + this.game.camera.y - 16;

        
        var angle = Math.atan(dy/dx);

        var v = { x: Math.cos(angle),
                 y: Math.sin(angle)};

        
        
        if (dx < 0)
            v.x *= -1;

        if ((angle > 0 && dy < 0) || (angle < 0 && dy > 0))
            v.y *= -1;
        
        // transformation for rotation
        var c = {};
        c.x = v.x * Math.cos(this.game.camera.rotation) + v.y * Math.sin(this.game.camera.rotation);
        c.y = -v.x * Math.sin(this.game.camera.rotation) + v.y * Math.cos(this.game.camera.rotation);
        
        return c;
    }

    handleCollision() {
        var that = this;
        this.game.entities.forEach(e => {
            
            if (e instanceof Obstacles && that.bound.collide(e.bound)) {
                console.log("s");
                if (e.bound instanceof BoundingBox) {

                    if (that.bound.bottom >= e.bound.top && that.bound.top < e.bound.top) {
                        that.velocity.y = 0;
                        console.log("top");
                    }

                } else {

                }
            }
        });
    }
}