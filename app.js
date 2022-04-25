// Create the application helper and add its render target to the page

const WIDTH = 800;
const HEIGHT = 600;


let Enemies = [];
let faceEast = [];

let playerMoves = 0;
let playerDirection = 'right';

function tick() {
    for(let i = 0; i < Enemies.length; ++i) {
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
    if(playerMoves) {
        if(playerDirection === 'left' && player.x - 5 > 0) {
            player.x -= 5;
        }
        else if(playerDirection === 'right' && player.x + 5 < WIDTH) {
            player.x += 5;
        }
        playerMoves--;
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

    console.log(nEnemies);

    for(let i = 0; i < nEnemies; ++i) {
        Enemies.push(GameObject(myRandom(10, WIDTH - 50), myRandom(50, 150), 'Icons/enemy-helicopter256-fl.png'));
        if(myRandom(0, 1)) {
            faceEast.push(true);
        } else {
            faceEast.push(false);
        }

    }
}

let app = new PIXI.Application({ width: WIDTH, height: HEIGHT, backgroundColor: 0xfae13c});
document.getElementById("game-frame").appendChild(app.view);

let enemy_text = new PIXI.Texture.from('Icons/enemy-helicopter256-fl.png');

let player = GameObject(WIDTH / 2, HEIGHT - 50, 'Icons/player256-fl.png');
document.getElementById("game-frame").addEventListener('click', playerMov);

function playerMov(event) {
    //console.log(event.details);
    console.log(event.x + ' ' + event.y);
    var x = event.x - (screen.width/2 - 400);

    console.log(x + ' ' + playerMoves);

    if(player.x > x) {
        playerMoves = Math.ceil((player.x - x)/5);
        playerDirection = 'left';
    }
    else {
        playerMoves = Math.ceil((x - player.x)/5);
        playerDirection = 'right';
    }
}

//app.stage.addChild(sprite);
app.stage.addChild(player);

generateLevel();

for(let i = 0; i < Enemies.length; ++i) {
    app.stage.addChild(Enemies[i]);
}

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  tick();
});
