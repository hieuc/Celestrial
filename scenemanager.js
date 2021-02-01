class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.char;
        this.dummy;
    };

    update() {
        if (this.game.started) {
            this.x = this.char.x - PARAMS.canvas_width/2 + 25;
            this.y = this.char.y - PARAMS.canvas_height/2 + 25;
        }
    };

    loadMap() {
        this.draw = function (){};
        this.game.entities = [];
        var b = 8;  // unit size
        var scale = 4;
        var that = this;
        // 0 = none, 1 = block
        // ! = ground, $ = carpet 
        // % = oryx logo, ^ = path intersection
        // t = carpet edge top, b = carpet edge bottom
        // l = carpet edge left, r = carpet edge right
        // q = carpet tl corner, w = carpet tr corner
        // e = carpet bl corner, a = carpet br corner
        // s = vertical path, d = horizontal path
        var keys = {
            "1" : {x: 0, y: 35},
            "!" : {x: 0, y: 74},
            "$" : {x: 1, y: 3},
            "%" : {x: 1, y: 1},
            "^" : {x: 0, y: 72},
            "t" : {x: 1, y: 0},
            "b" : {x: 1, y: 4},
            "l" : {x: 0, y: 1},
            "r" : {x: 6, y: 1},
            "q" : {x: 0, y: 0},
            "w" : {x: 6, y: 0},
            "e" : {x: 0, y: 4},
            "a" : {x: 6, y: 4},
            "d" : {x: 1, y: 72},
            "s" : {x: 8, y: 72}
        }

        var map = 
            "000000000000000111111111000000000000000" +
            "000000000000111!!sl$rs!!111000000000000" +
            "000000000011!!!!!sl$rs!!!!!110000000000" + 
            "0000000001ddddddd^l$r^ddddddd1000000000" +
            "000000001s!!!!!!!sl$rs!!!!!!!s100000000" +
            "00000001!s!!!!!!!sl$rs!!!!!!!s!10000000" +
            "0000001!!s!!!!!!!sl$rs!!!!!!!s!!1000000" +
            "000001!!!s!!!!!!!sl$rs!!!!!!!s!!!100000" +
            "00001!!!!s!!!!!!!sl$rs!!!!!!!s!!!!10000" +
            "0001!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!1000" +
            "001!!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!!100" +
            "001dddddd^ddddddd^l$r^ddddddd^dddddd100" +
            "01!!!!!!!s!!!!!!!q$$$w!!!!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!!qt$$$$$tw!!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!q$$$$$$$$$w!!!!s!!!!!!!10" +
            "1s!!!!!!!s!!!q$$$$$$$$$$$w!!!s!!!!!!!s1" +
            "1s!!!!!!!s!!!l$$$$$$$$$$$r!!!s!!!!!!!s1" +
            "1s!!!!!!!s!!q$$$$$$$$$$$$$w!!s!!!!!!!s1" +
            "1ttttttttttt$$$$$%0000$$$$$ttttttttttt1" +
            "1$$$$$$$$$$$$$$$$00000$$$$$$$$$$$$$$$$1" +
            "1bbbbbbbbbbb$$$$$00000$$$$$bbbbbbbbbbb1" +
            "1s!!!!!!!s!!e$$$$$$$$$$$$$a!!s!!!!!!!s1" +
            "1s!!!!!!!s!!!l$$$$$$$$$$$r!!!s!!!!!!!s1" +
            "1s!!!!!!!s!!!e$$$$$$$$$$$a!!!s!!!!!!!s1" +
            "01!!!!!!!s!!!!e$$$$$$$$$a!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!!eb$$$$$ba!!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!!!!e$$$a!!!!!!!s!!!!!!!10" +
            "001dddddd^ddddddd^l$r^ddddddd^dddddd100" +
            "001!!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!!100" +
            "0001!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!1000" +
            "00001!!!!s!!!!!!!sl$rs!!!!!!!s!!!!10000" +
            "000001!!!s!!!!!!!sl$rs!!!!!!!s!!!100000" +
            "0000001!!s!!!!!!!sl$rs!!!!!!!s!!1000000" +
            "00000001!s!!!!!!!sl$rs!!!!!!!s!10000000" +
            "000000001s!!!!!!!sl$rs!!!!!!!s100000000" +
            "0000000001ddddddd^l$r^ddddddd1000000000" +
            "000000000011!!!!!sl$rs!!!!!110000000000" +
            "000000000000111!!sl$rs!!111000000000000" +
            "000000000000000111111111000000000000000";

        for (var i = 0; i < 39; i++) {
            for (var j = 0; j < 39; j++) {
                var ch = map[i * 39 + j];
                if (ch === "0")
                    continue;

                var bg = null;
                if (ch === "%")
                    bg = new Ground(this.game, j * b * scale, i * b * scale, keys[ch].x * b, keys[ch].y * b, b * 5, b * 3);
                else if (ch === "!") {
                    var r = this.randInt(0, 25);
                    bg = new Ground(this.game, j * b * scale, i * b * scale, (keys[ch].x + r % 15) * b, (keys[ch].y + Math.floor(r / 15)) * b, b, b);
                } else if (ch === "1") {
                    bg = new Obstacles(this.game, j * b * scale, i * b * scale, keys[ch].x * b, keys[ch].y * b, b, b);
                    this.game.addEntity(bg);
                } else if (ch === "s" || ch === "d") {
                    var r = this.randInt(0, 6);
                    bg = new Ground(this.game, j * b * scale, i * b * scale, (keys[ch].x + r) * b, keys[ch].y * b, b, b);
                } else     
                    bg = new Ground(this.game, j * b * scale, i * b * scale, keys[ch].x * b, keys[ch].y * b, b, b);
                
                if (bg)
                    this.game.addBackground(bg);
            }  
        }

        var character = new Wizard(this.game, 624, 624); 
        this.char = character;
        
        setInterval(() => {
            for (var i = 0; i < 20; i++) {
                var r = 580 * Math.sqrt(Math.random());
                var theta = Math.random() * 2 * Math.PI;
    
                var dx = r * Math.cos(theta);
                var dy = r * Math.sin(theta); 
                this.game.addProjectile(new Beam(this.game, 624 + dx, 624 + dy));
            }
        }, 3000);
        
        this.game.addEntity(new Portal(this.game, 624, 624, 520, 0));
        this.game.addEntity(new Portal(this.game, 624, 624, 520, Math.PI / 2));
        this.game.addEntity(new Portal(this.game, 624, 624, 520, Math.PI));
        this.game.addEntity(new Portal(this.game, 624, 624, 520, Math.PI * 1.5));
        
        this.game.addEntity(new Oryx(this.game, 624, 624, 210, 0));
        
        this.game.addEntity(this.char);
        //audio.play();
    }

    draw(ctx) {
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.fillText("just dodge", PARAMS.canvas_width/3, PARAMS.canvas_height / 1.5);
        ctx.fillText("WASD to move", PARAMS.canvas_width/4, PARAMS.canvas_height/3);
        ctx.fillText("use checkbox below to mute music", PARAMS.canvas_width/4, PARAMS.canvas_height/2.5);
        ctx.fillStyle = "red";
        ctx.fillText("press any key to start", PARAMS.canvas_width/4, PARAMS.canvas_height/2);
    };

    randInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

/*
class Minimap {
    constructor(game, x, y, w) {
        Object.assign(this, { game, x, y, w });
    };

    update() {

    };

    draw(ctx) {
        ctx.strokeStyle = "Black";
        ctx.strokeRect(this.x, this.y, this.w, PARAMS.BLOCKWIDTH);
        for (var i = 0; i < this.game.entities.length; i++) {
            this.game.entities[i].drawMinimap(ctx, this.x, this.y);
        }
    };
};*/