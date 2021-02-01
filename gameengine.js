// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor() {
        this.entities = [];
        this.background = [];
        this.projectiles = [];
        this.ctx = null;

        this.left = false;
        this.right= false;
        this.up = false;
        this.down = false;
    };

    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        var that = this;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    };

    startInput() {
        var that = this;
        var c = that.entities[that.entities.length-1];

        var getXandY = function (e) {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

            return { x: x, y: y };
        }

        this.ctx.canvas.addEventListener("keydown", e => {
            switch (e.key) {
                case 'd':
                    that.right = true;
                    break;
                case 'a':
                    that.left = true;
                    break;
                case 's':
                    that.down = true;
                    break;
                case 'w':
                    that.up = true;
                    break;
                default:
                    break;
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", e => {
            switch (e.key) {
                case 'd':
                    that.right = false;
                    break;
                case 'a':
                    that.left = false;
                    break;
                case 's':
                    that.down = false;
                    break;
                case 'w':
                    that.up = false;
                    break;
                default:
                    break;
            }
        }, false);

        this.ctx.canvas.addEventListener("mousemove", function (e) {
            //console.log(getXandY(e));
            that.mouse = getXandY(e);
        }, false);

        this.ctx.canvas.addEventListener("click", function (e) {
            that.click = getXandY(e);
            c.startAttack(that.click);
        }, false);

        this.ctx.canvas.addEventListener("wheel", function (e) {
            //console.log(getXandY(e));
            that.wheel = e;
            //       console.log(e.wheelDelta);
            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("contextmenu", function (e) {
            //console.log(getXandY(e));
            that.rightclick = getXandY(e);
            e.preventDefault();
        }, false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    addBackground(bg) {
        this.background.push(bg);
    }

    addProjectile(p) {
        this.projectiles.push(p);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.background.length; i++) {
            this.background[i].draw(this.ctx);
        }

        for (var i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].draw(this.ctx);
        }
        
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }

        

        this.camera.draw(this.ctx);
    };

    update() {
        var entitiesCount = this.entities.length;

        for (var i = 0; i < this.projectiles.length; i++) {
            var p = this.projectiles[i];

            if (!p.removeFromWorld) {
                p.update();
            }
        }

        for (var i = this.projectiles.length - 1; i >= 0; --i) {
            if (this.projectiles[i].removeFromWorld) {
                this.projectiles.splice(i, 1);
            }
        }

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
        this.camera.update();
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };
};