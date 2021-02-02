class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop) {
        Object.assign(this, { spritesheet, xStart, yStart, height, width, frameCount, frameDuration, framePadding, reverse, loop });

        this.elapsedTime = 0;
        this.totalTime = this.frameCount * this.frameDuration;
        this.prevAngle = 0;
        this.cache = [];
    };

    drawFrame(tick, ctx, x, y, scale, angle) {
        this.elapsedTime += tick;

        if (this.isDone()) {
            if (this.loop) {
                this.elapsedTime -= this.totalTime;
            } else {
                return;
            }
        }

        let frame = this.currentFrame();
        if (this.reverse) frame = this.frameCount - frame - 1;

        if (angle) {
            if (angle !== this.prevAngle) {
                for (var i = 0; i < this.frameCount; i++) {
                    this.cache[i] = this.rotate(this.xStart + i * (this.width + this.framePadding),
                        this.yStart, scale, angle);
                }

            }
                        
            this.prevAngle = angle;
            
            ctx.drawImage(this.cache[frame], x, y,
                this.width * scale, this.height * scale);
        } else {
            ctx.drawImage(this.spritesheet,
                this.xStart + frame * (this.width + this.framePadding), this.yStart, //source from sheet
                this.width, this.height,
                x, y,
                this.width * scale,
                this.height * scale);
        }
        
    };

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };

    isAlmostDone(tick) {
        return (this.elapsedTime + tick >= this.totalTime);
    };

    rotate(sx, sy, scale, angle) {
        var c2 = document.createElement("canvas");
        c2.width = this.width * scale;
        c2.height = this.height * scale;
        var ctx2 = c2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.save();
        ctx2.translate(this.width * scale / 2, this.height * scale / 2);
        ctx2.rotate(angle);
        ctx2.translate(-this.width * scale / 2, -this.height * scale / 2);
        ctx2.drawImage(this.spritesheet, sx, sy, this.width, this.height, 0, 0, this.width * scale, this.height * scale);

        return c2;
    }
};