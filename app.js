// Create the application helper and add its render target to the page

const WIDTH = 800;
const HEIGHT = 600;

let Enemies = [];
let faceEast = [];

fucntion tick() {
    for(int i = 0; i < Enemies.length(); ++i) {
        if(faceEast[i]) {
            if(Enemies[i].x + 5 > WIDTH - 30) {
                faceEast[i] = false;
                Enemies[i].x -= 5;
            } else {
                Enemies[i].x +=  5;
            }
        }
        else {
            if(Enemies[i].x - 5 < 0) {
                faceEast[i] = true;
                Enemies[i].x += 5;
            } else {
                Enemies[i].x -=  5;
            }
        }
    }
}
function myRandom(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
}

function GameObject(posX, posY, imgurl) {
    let gameObj = new PIXI.Texture.from(imgurl);
    let sprite = new PIXI.Sprite.from(gameObj);

    sprite.setTransform(0, 0, 0.2, 0.2, 0, 0, 0, 0, 0);
    sprite.x = posX;
    sprite.y = posY;

    return sprite;
}

function generateLevel() {
    const nEnemies = myRandom(5, 15);

    for(let i = 0; i < nEnemies; ++i) {
        Enemies.push(GameObject(myRandom(10, WIDTH - 50), myRandom(50, 150), 'Icons/enemy-helicopter256-fl.png'));
        faceEast.push(true);
    }
}

let app = new PIXI.Application({ width: WIDTH, height: HEIGHT, backgroundColor: 0xfae13c});
document.getElementById("game-frame").appendChild(app.view);

let enemy_text = new PIXI.Texture.from('Icons/enemy-helicopter256-fl.png');

// Create the sprite and add it to the stage
let sprite = new PIXI.Sprite.from(enemy_text);
sprite.setTransform(0, 0, 0.2, 0.2, 0, 0, 0, 0, 0);

let player = GameObject(WIDTH / 2, HEIGHT - 50, 'Icons/player256-fl.png');

app.stage.addChild(sprite);
app.stage.addChild(player);

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  tick();
});
