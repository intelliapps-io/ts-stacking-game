class Sketch {
  allowTouch: boolean;
  blocks: Array<Block>;
  loopDegree: number;
  loopHue: number;
  gameOver: boolean;
  height: number;
  width: number;
  level: number;
  highScore: number = 0;
  hueCounter: number;
  getNextHue =(p: p5) => { 
    if (this.loopHue > 300) { this.loopHue = 0 } else { this.loopHue += 10; }
    return this.loopHue;
  }
  levelHeight = (p: p5) => p.height - (this.height * (this.level + 1));

  private initialize(p: p5) {
    this.allowTouch = true;
    this.blocks = [];
    this.loopHue = p.random(0, 255);
    this.loopDegree = p.random(0, 360);
    this.gameOver = false;
    this.height = 40;
    this.width = p.width < 600 ? p.width - 200 : 400;
    this.level = 1;
    this.blocks.push(new Block(0 - this.width / 2, p.height - this.height, this.width, this.height, p, { hue: this.getNextHue(p) })); // initialize level 0
    this.blocks.push(new Block(0, this.levelHeight(p), this.width, this.height, p, { hue: this.getNextHue(p) })); // initialize level 1
  }

  private displayLevel(p: p5) {
    p.push();
    p.colorMode(p.HSB);
    p.textSize(25);
    p.textStyle(p.BOLD);
    p.fill(this.loopHue, 40, 100);
    p.text('Level: ' + this.level, (-p.width / 2) + 10, 40);
    p.pop();
  }

  private slideCurrentLevel(p: p5) {
    const block = this.blocks[this.blocks.length - 1];
    const bound = {
      max: 600,
      left: () => -1 * (p.width / 2) > -1 * bound.max ? -1 * (p.width / 2) : -1 * bound.max,
      right: () => (p.width / 2) < bound.max ? (p.width / 2) - block.width : bound.max - block.width
    }
    const x = p.map(p.sin(this.loopDegree), -1, 1, bound.left(), bound.right());
    block.setPosition(x, block.position.y);
    if (this.loopDegree > 360) { this.loopDegree = 0 } else { this.loopDegree += 0.5 + (this.level / 10) }
  }

  private onInput(func: Function, p: p5) {
    p.keyPressed = () => p.keyCode === 32 ? func() : null;
    p.touchStarted = () => { if (this.allowTouch) func(); this.allowTouch = false; }
    p.touchEnded = () => setTimeout(() => this.allowTouch = true, 100);
  }

  private nextLevel(p: p5) {
    this.level++;
    const blockA = this.blocks[this.blocks.length - 1];
    const blockB = this.blocks[this.blocks.length - 2];
    let difference = blockB.position.x - blockA.position.x;
    const newWidth = Math.abs(this.width - Math.abs(difference));
    if (newWidth <= this.width) {
      // Check if last block was not stacked
      let boundaryA = {start: blockA.position.x + (p.width / 4), end: 0}; boundaryA.end = boundaryA.start + blockA.width;
      let boundaryB = {start: blockB.position.x + (p.width / 4), end: 0}; boundaryB.end = boundaryB.start + blockB.width;
      if (boundaryA.end < boundaryB.start || boundaryA.start > boundaryB.end ) { this.gameOver = true }
      
      // Shrink next level width
      if (Math.abs(difference) < 20) { difference = 0 } else { this.width = newWidth; blockA.width = this.width; }
      if (difference >= 0) blockA.setPosition(blockB.position.x, blockA.position.y); // Move left on left-sided hangover
      
      // Next level
      const newBlock = new Block(0, this.levelHeight(p), this.width, this.height, p, { hue: this.getNextHue(p) });
      this.blocks.push(newBlock);
    } else {
      this.gameOver = true;
    }
  }

  private displayGameover(p: p5) {
    if (this.level > this.highScore) this.highScore = this.level;
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
  }

  public setup(p: p5) {
    p.pixelDensity(1);
    p.angleMode(p.DEGREES);
    p.createCanvas(p.windowWidth, p.windowHeight);
    this.initialize(p);
  }

  public draw(p: p5) {
    if (!this.gameOver) {
      p.background(100);
      p.translate(p.width / 2, 0); // center x-axis
      this.displayLevel(p);
      if (this.levelHeight(p) < p.height / 2) p.translate(0, (-1 * this.levelHeight(p)) + Math.floor(p.height / 2)); // shift scene down when blocks stack too high
      this.slideCurrentLevel(p);
      this.onInput(() => this.nextLevel(p), p);
      this.blocks.forEach(block => block.draw()); // render blocks
    } else {
      // p.background(p.color(255, 0, 0));
      // p.translate((p.width / 2) - 100, p.height / 2); // center x-axis
      this.displayGameover(p);
      this.onInput(() => this.initialize(p), p);
    }
  }
}

const createSketch = (p: p5) => {
  const sketch = new Sketch();
  p.setup = () => sketch.setup(p);
  p.draw = () => sketch.draw(p);
}

const mySketch = new p5(createSketch);