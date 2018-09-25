interface IOptions {
  hue: number;
}

class Block {
  private p: p5;
  position: p5.Vector;
  width: number;
  height: number;
  options: IOptions;

  constructor(x: number, y: number, width: number, height: number, p: p5, options?: IOptions) {
    this.p = p;
    this.position = this.p.createVector(x, y);
    this.width = width;
    this.height = height;
    this.options = options;
  }

  setPosition(x: number, y: number, ) {
    this.position = this.p.createVector(x, y);
  }

  draw() {
    const p = this.p;
    const border = 8;
    p.push();

    p.translate(this.position.x, this.position.y);

    p.colorMode(p.HSB);
    p.noStroke();

    p.fill(this.options ? this.options.hue : 0, 70, 100);
    p.rect(0, 0, this.width, this.height); // Main Block

    const v = {
      top: {
        left: p.createVector(border, border),
        right: p.createVector(this.width - border, border)
      },
      bottom: {
        left: p.createVector(border, this.height - border),
        right: p.createVector(this.width - border, this.height - border)
      }
    };
    
    p.fill(this.options ? this.options.hue : 0, 20, 255); // top
    p.quad(0, 0, this.width, 0, v.top.right.x, v.top.right.y, v.top.left.x, v.top.left.y); 

    p.fill(this.options ? this.options.hue : 0, 40, 255); // left
    p.quad(0, 0, v.top.left.x, v.top.left.y , v.bottom.left.x, v.bottom.left.y, 0, this.height); 

    p.fill(this.options ? this.options.hue : 0, 40, 0, 0.5); // bottom
    p.quad(v.bottom.left.x, v.bottom.left.y, v.bottom.right.x, v.bottom.right.y, this.width, this.height, 0, this.height); 

    p.fill(this.options ? this.options.hue : 0, 20, 0, 0.3); // right
    p.quad(v.top.right.x, v.top.right.y, this.width, 0, this.width, this.height, v.bottom.right.x, v.bottom.right.y); 

    p.pop();
  }
}