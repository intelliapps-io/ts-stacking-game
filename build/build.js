var Block = (function () {
    function Block(x, y, width, height, p, options) {
        this.p = p;
        this.position = this.p.createVector(x, y);
        this.width = width;
        this.height = height;
        this.options = options;
    }
    Block.prototype.setPosition = function (x, y) {
        this.position = this.p.createVector(x, y);
    };
    Block.prototype.draw = function () {
        var p = this.p;
        var border = 8;
        p.push();
        p.translate(this.position.x, this.position.y);
        p.colorMode(p.HSB);
        p.noStroke();
        p.fill(this.options ? this.options.hue : 0, 70, 100);
        p.rect(0, 0, this.width, this.height);
        var v = {
            top: {
                left: p.createVector(border, border),
                right: p.createVector(this.width - border, border)
            },
            bottom: {
                left: p.createVector(border, this.height - border),
                right: p.createVector(this.width - border, this.height - border)
            }
        };
        p.fill(this.options ? this.options.hue : 0, 20, 255);
        p.quad(0, 0, this.width, 0, v.top.right.x, v.top.right.y, v.top.left.x, v.top.left.y);
        p.fill(this.options ? this.options.hue : 0, 40, 255);
        p.quad(0, 0, v.top.left.x, v.top.left.y, v.bottom.left.x, v.bottom.left.y, 0, this.height);
        p.fill(this.options ? this.options.hue : 0, 40, 0, 0.5);
        p.quad(v.bottom.left.x, v.bottom.left.y, v.bottom.right.x, v.bottom.right.y, this.width, this.height, 0, this.height);
        p.fill(this.options ? this.options.hue : 0, 20, 0, 0.3);
        p.quad(v.top.right.x, v.top.right.y, this.width, 0, this.width, this.height, v.bottom.right.x, v.bottom.right.y);
        p.pop();
    };
    return Block;
}());
var Sketch = (function () {
    function Sketch() {
        var _this = this;
        this.highScore = 0;
        this.getNextHue = function (p) {
            if (_this.loopHue > 300) {
                _this.loopHue = 0;
            }
            else {
                _this.loopHue += 10;
            }
            return _this.loopHue;
        };
        this.levelHeight = function (p) { return p.height - (_this.height * (_this.level + 1)); };
    }
    Sketch.prototype.initialize = function (p) {
        this.allowTouch = true;
        this.blocks = [];
        this.loopHue = p.random(0, 255);
        this.loopDegree = p.random(0, 360);
        this.gameOver = false;
        this.height = 40;
        this.width = p.width < 600 ? p.width - 200 : 400;
        this.level = 1;
        this.blocks.push(new Block(0 - this.width / 2, p.height - this.height, this.width, this.height, p, { hue: this.getNextHue(p) }));
        this.blocks.push(new Block(0, this.levelHeight(p), this.width, this.height, p, { hue: this.getNextHue(p) }));
    };
    Sketch.prototype.displayLevel = function (p) {
        p.push();
        p.colorMode(p.HSB);
        p.textSize(25);
        p.textStyle(p.BOLD);
        p.fill(this.loopHue, 40, 100);
        p.text('Level: ' + this.level, (-p.width / 2) + 10, 40);
        p.pop();
    };
    Sketch.prototype.slideCurrentLevel = function (p) {
        var block = this.blocks[this.blocks.length - 1];
        var bound = {
            max: 600,
            left: function () { return -1 * (p.width / 2) > -1 * bound.max ? -1 * (p.width / 2) : -1 * bound.max; },
            right: function () { return (p.width / 2) < bound.max ? (p.width / 2) - block.width : bound.max - block.width; }
        };
        var x = p.map(p.sin(this.loopDegree), -1, 1, bound.left(), bound.right());
        block.setPosition(x, block.position.y);
        if (this.loopDegree > 360) {
            this.loopDegree = 0;
        }
        else {
            this.loopDegree += 0.5 + (this.level / 10);
        }
    };
    Sketch.prototype.onInput = function (func, p) {
        var _this = this;
        p.keyPressed = function () { return p.keyCode === 32 ? func() : null; };
        p.touchStarted = function () { if (_this.allowTouch)
            func(); _this.allowTouch = false; };
        p.touchEnded = function () { return setTimeout(function () { return _this.allowTouch = true; }, 100); };
    };
    Sketch.prototype.nextLevel = function (p) {
        this.level++;
        var blockA = this.blocks[this.blocks.length - 1];
        var blockB = this.blocks[this.blocks.length - 2];
        var difference = blockB.position.x - blockA.position.x;
        var newWidth = Math.abs(this.width - Math.abs(difference));
        if (newWidth <= this.width) {
            var boundaryA = { start: blockA.position.x + (p.width / 4), end: 0 };
            boundaryA.end = boundaryA.start + blockA.width;
            var boundaryB = { start: blockB.position.x + (p.width / 4), end: 0 };
            boundaryB.end = boundaryB.start + blockB.width;
            if (boundaryA.end < boundaryB.start || boundaryA.start > boundaryB.end) {
                this.gameOver = true;
            }
            if (Math.abs(difference) < 20) {
                difference = 0;
            }
            else {
                this.width = newWidth;
                blockA.width = this.width;
            }
            if (difference >= 0)
                blockA.setPosition(blockB.position.x, blockA.position.y);
            var newBlock = new Block(0, this.levelHeight(p), this.width, this.height, p, { hue: this.getNextHue(p) });
            this.blocks.push(newBlock);
        }
        else {
            this.gameOver = true;
        }
    };
    Sketch.prototype.displayGameover = function (p) {
        if (this.level > this.highScore)
            this.highScore = this.level;
        p.push();
        p.translate(p.width / 2, p.height / 2);
        p.background(252, 63, 63, 200);
        p.textStyle(p.BOLD);
        p.textAlign(p.CENTER);
        p.textSize(60);
        p.text('Game Over', 0, -100);
        p.textSize(25);
        p.text('Your Score: ' + this.level, -100, 0);
        p.text('High Score: ' + this.highScore, 100, 0);
        p.textSize(20);
        p.textStyle(p.ITALIC);
        p.text('Click to play again', 0, 100);
        p.pop();
    };
    Sketch.prototype.setup = function (p) {
        p.pixelDensity(1);
        p.angleMode(p.DEGREES);
        p.createCanvas(p.windowWidth, p.windowHeight);
        this.initialize(p);
    };
    Sketch.prototype.draw = function (p) {
        var _this = this;
        if (!this.gameOver) {
            p.background(100);
            p.translate(p.width / 2, 0);
            this.displayLevel(p);
            if (this.levelHeight(p) < p.height / 2)
                p.translate(0, (-1 * this.levelHeight(p)) + Math.floor(p.height / 2));
            this.slideCurrentLevel(p);
            this.onInput(function () { return _this.nextLevel(p); }, p);
            this.blocks.forEach(function (block) { return block.draw(); });
        }
        else {
            this.displayGameover(p);
            this.onInput(function () { return _this.initialize(p); }, p);
        }
    };
    return Sketch;
}());
var createSketch = function (p) {
    var sketch = new Sketch();
    p.setup = function () { return sketch.setup(p); };
    p.draw = function () { return sketch.draw(p); };
};
var mySketch = new p5(createSketch);
//# sourceMappingURL=build.js.map