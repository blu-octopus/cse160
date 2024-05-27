class Onigiri {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    render () {
        var rice = new Prism();
        rice.color = [241/255, 244/255, 251/255, 1.0];
        rice.textureNum = 3;
        rice.matrix.translate(1, 0.5, 2);
        rice.render();

        var seaweed = new Cube();
        seaweed.color = [0.0, 0.5, 0.0, 1.0];
        seaweed.textureNum = -2;
        seaweed.matrix = rice.matrix;
        seaweed.matrix.scale(.5, .5, 0);
        seaweed.matrix.translate(.1, -.8, 0);
        seaweed.render();

        var appleColor = [255/255,0/255,0/255,1.0];
        var stemColor = [165/255,42/255,42/255,1.0];
        var leafColor = [0/255,255/255,0/255,1.0];
        if(appleSwitch){
          var apple = new Cube();
          var stem = new Cube();
          var leaf = new Cone();
          apple.matrix.rotate(0,0,0,1);
          apple.matrix.scale(.25,.25,.25);
          apple.matrix.translate(-0.5,2.5,0);
          apple.color = appleColor;
          stem.matrix = new Matrix4(apple.matrix);
          stem.matrix.rotate(0,0,0,1);
          stem.matrix.scale(.25,.5,.25);
          stem.matrix.translate(1.5,2,1);
          stem.color = stemColor;
          leaf.matrix = new Matrix4(stem.matrix);
          leaf.matrix.scale(5,5,5);
          leaf.matrix.translate(0.4,0.08,0.1);
          leaf.matrix.rotate(270,0,1,0);
          leaf.color = leafColor;
          stem.render();
          apple.render();
          leaf.render();
        }
    }
}