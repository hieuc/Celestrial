class Ground {
    constructor(game, x, y, sx, sy, w, h) {
        Object.assign(this, { game, x, y, sx, sy, w, h});

        this.scale = 4;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/background.png");
    };

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.spritesheet, this.sx, this.sy, this.w, this.h, 
            this.x - this.game.camera.x, this.y - this.game.camera.y,
            this.w * this.scale, this.h * this.scale);
    }
}

class Obstacles extends Ground{
    constructor(game, x, y, sx, sy, w, h) {
        super(game, x, y, sx, sy, w, h);

        this.bound = new BoundingBox(x, y, w * this.scale, h * this.scale);
    }

    draw(ctx){
        ctx.drawImage(this.spritesheet, this.sx, this.sy, this.w, this.h, 
            this.x - this.game.camera.x, this.y - this.game.camera.y,
            this.w * this.scale, this.h * this.scale);
        if (PARAMS.debug) {
            this.bound.draw(this.game, this.game.ctx);
            //this.leftB.draw(this.game, this.game.ctx);
            //this.rightB.draw(this.game, this.game.ctx);
            //this.topB.draw(this.game, this.game.ctx);
            //this.botB.draw(this.game, this.game.ctx);
        }
    }
}