/*
    Backgrounds are from: Fantasy Asset Pack.
    https://anokolisa.itch.io/high-forest-assets-pack
*/

class ParallaxTest{
    constructor(context2d){
      this.matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
      this.ctx = context2d;
      this.width = context2d.canvas.width;
      this.height = context2d.canvas.height;
      this.back0 = context2d.createPattern(img_b0, 'repeat');
      this.back1 = context2d.createPattern(img_b1, 'repeat');
      this.back2 = context2d.createPattern(img_b2, 'repeat');
      this.back3 = context2d.createPattern(img_b3, 'repeat');
    }
  
    draw(){
      this.ctx.fillStyle = this.back0;
      this.ctx.fillRect(0, 0, this.width, this.height)
      this.ctx.fillStyle = this.back3;
      this.ctx.fillRect(0, 0, this.width, this.height)
      this.ctx.fillStyle = this.back2;
      this.ctx.fillRect(0, 0, this.width, this.height)
      this.ctx.fillStyle = this.back1;
      this.ctx.fillRect(0, 0, this.width, this.height)
    }
  
    update(t){
      this.back0.setTransform(this.matrix.translate(t * 10, 0).scale(6));
      this.back1.setTransform(this.matrix.translate(t * 90, 0).scale(6));
      this.back2.setTransform(this.matrix.translate(t * 60, 0).scale(6));
      this.back3.setTransform(this.matrix.translate(t * 30, 0).scale(6));
    }
  }
  
  !(function(){
      const ctx = ganvas.getContext("2d", {alpha: false, antialias: false, depth: false});
      ctx.imageSmoothingEnabled = false;
      const parallaxTest = new ParallaxTest(ctx);
  
      function mainLoop(t){
          parallaxTest.update(-t/444);
          parallaxTest.draw();
          requestAnimationFrame(mainLoop);
      }
      mainLoop(0);
  })();
  