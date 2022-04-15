// Create the application helper and add its render target to the page

const WIDTH = 800;
const HEIGHT = 600;

let app = new PIXI.Application({ width: WIDTH, height: HEIGHT, backgroundColor: 0xfae13c});
document.getElementById("game-frame").appendChild(app.view);

let enemy_text = new PIXI.Texture.from('Icons/enemy-helicopter256-fl.png');

// Create the sprite and add it to the stage
let sprite = new PIXI.Sprite.from(enemy_text);
sprite.setTransform(0, 0, 0.2, 0.2, 0, 0, 0, 0, 0);

app.stage.addChild(sprite);

let faceEast = true;

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  if(faceEast) {
      if(sprite.x + 5 > WIDTH - 30) {
          faceEast = false;
          sprite.x -= 5;
      } else {
          sprite.x +=  5;
      }
  }
  else {
      if(sprite.x - 5 < 0) {
          faceEast = true;
          sprite.x += 5;
      } else {
          sprite.x -=  5;
      }
  }
});
