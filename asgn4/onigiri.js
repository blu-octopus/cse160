class Onigiri {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    render () {
        var rice = new Prism();
        rice.color = [241/255, 244/255, 251/255, 1.0];
        rice.textureNum = 3;
        rice.matrix.translate(-5, -.7, 0);
        rice.matrix.scale(2, 2, 2);
        rice.render();
      
        var seaweed = new Cube();
        seaweed.color = [0.0, 0.5, 0.0, 1.0];
        seaweed.textureNum = 2;
        seaweed.matrix = rice.matrix;
        seaweed.matrix.scale(.5, .4, .6);
        seaweed.matrix.translate(.45, 0, -.1);
        seaweed.render();
    }
}