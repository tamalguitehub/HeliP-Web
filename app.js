const WIDTH = window.innerWidth;
const HEIGHT = 600;

// Adding Mouse Click Listener for the game
document.addEventListener('click', playerMov);

// Adding Keyboard Listener for the game
document.addEventListener('keydown', playerMovKey);

// Main Game App
let app = new PIXI.Application({ width: WIDTH, height: HEIGHT, backgroundColor: 0xfae13c});

let graphics = new PIXI.Graphics();

let isHelipRunning = false;

let enemyBuffImgW = PIXI.BaseTexture.from('Icons/enemy-helicopter256-fl.png');
let enemyBuffImgE = PIXI.BaseTexture.from('Icons/enemy-helicopter256-fr.png');

let bulletBuffImg = PIXI.BaseTexture.from('Icons/bullet256-fd.png');
let medicBuffImg = PIXI.BaseTexture.from('Icons/pharmacy256.png');
let barrierBuffImg = PIXI.BaseTexture.from('Icons/barrier256.png');

const BULLET_DROP_PROB = 1500;
const MEDIC_DROP_PROB = 100;

let HealthX = 100;
let Enemies = [];
let faceEast = [];
let Bullets = [];
let Medics = [];
let Barrier = [];
let healthBarrier = [];

let player = GameObject(WIDTH / 2, HEIGHT - 50, 0.2, 'Icons/player256-fl.png');

let playerMoves = 0;
let playerDirection = 'right';

let tickCount = 0;
const MAX_TICK_COUNT = 30;

function tick() {
    if(HealthX <= 0) {
        isHelipRunning = false;
    }

    tickCount++;

    let bulletGenerated = [];
    for(let i = 0; i < Enemies.length; ++i) {
        if(faceEast[i]) {
            if(Enemies[i].x + 5 > WIDTH - 30) {
                faceEast[i] = false;
                Enemies[i].texture = PIXI.Texture.from(enemyBuffImgW);
                Enemies[i].x -= 5;
            } else {
                Enemies[i].x +=  5;
            }
        }
        else {
            if(Enemies[i].x - 5 < 0) {
                faceEast[i] = true;
                Enemies[i].texture = PIXI.Texture.from(enemyBuffImgE);
                Enemies[i].x += 5;
            } else {
                Enemies[i].x -=  5;
            }
        }

        if(tickCount === MAX_TICK_COUNT) {
            var genBul = myRandom(0, 2000);

            if(genBul < BULLET_DROP_PROB) {
                var newBullet = GameObject(Enemies[i].x, Enemies[i].y, 0.1, bulletBuffImg);
                bulletGenerated.push(newBullet);
                console.log(newBullet.width + " " + newBullet.height);
                app.stage.addChild(newBullet);
            }
        }
    }

    var genMed = myRandom(0, 5000);

    if(genMed < MEDIC_DROP_PROB) {
        var newMedic = GameObject(myRandom(20, WIDTH - 20), myRandom(20, 50), 0.1, medicBuffImg);
        Medics.push(newMedic);
        //console.log(newBullet.width + " " + newBullet.height);
        app.stage.addChild(newMedic);
    }

    for(let i = 0; i < Medics.length; ++i) {
        Medics[i].y += 5;

        var Xp = player.x;
        var Yp = player.y;

        var Xb = Medics[i].x;
        var Yb = Medics[i].y;

        var collided = false;
        if(Xp > Xb && Xp - Xb < Medics[i].width) {
            if(Yp > Yb && Yp - Yb < Medics[i].height) {
                collided = true;
            }
            else if(Yp < Yb && Yb - Yp < player.height) {
                collided = true;
            }
        }
        else if(Xp < Xb && Xb - Xp < player.width) {
            if(Yp > Yb && Yp - Yb < Medics[i].height) {
                collided = true;
            }
            else if(Yp < Yb && Yb - Yp < player.height) {
                collided = true;
            }
        }

        if(collided) {
            HealthX = Math.min(HealthX + 10, 100);
            Medics[i].y = HEIGHT + 5;
        }

        if(Medics[i].y >= HEIGHT) {
            if(i != 0) {
                var tmp = Medics[0];
                Medics[0] = Medics[i];
                Medics[i] = tmp;
            }

            app.stage.removeChild(Medics[0]);
            Medics.shift();
        }
    }

    if(tickCount === MAX_TICK_COUNT && bulletGenerated.length) {
        bulletGenerated.sort(function(Ba, Bb) {return Ba.y - Bb.y});
        Bullets.push(bulletGenerated);
    }

    for(let i = 0; i < Bullets.length; ++i) {
        for(let j = 0; j < Bullets[i].length; ++j) {
            Bullets[i][j].y += 5;

            var Xp = player.x;
            var Yp = player.y;

            var Xb = Bullets[i][j].x;
            var Yb = Bullets[i][j].y;

            var collided = false;
            if(Xp > Xb && Xp - Xb < Bullets[i][j].width) {
                if(Yp > Yb && Yp - Yb < Bullets[i][j].height) {
                    collided = true;
                }
                else if(Yp < Yb && Yb - Yp < player.height) {
                    collided = true;
                }
            }
            else if(Xp < Xb && Xb - Xp < player.width) {
                if(Yp > Yb && Yp - Yb < Bullets[i][j].height) {
                    collided = true;
                }
                else if(Yp < Yb && Yb - Yp < player.height) {
                    collided = true;
                }
            }

            if(collided) {
                HealthX -= 5;
                Bullets[i][j].y = HEIGHT + 5;
            }

            for(let k = 0; k < Barrier.length; ++k) {
                var Xp = Barrier[k].x;
                var Yp = Barrier[k].y;

                var Xb = Bullets[i][j].x;
                var Yb = Bullets[i][j].y;

                var collided = false;

                if(Xp > Xb && Xp - Xb < Bullets[i][j].width) {
                    if(Yp > Yb && Yp - Yb < Bullets[i][j].height) {
                        collided = true;
                    }
                    else if(Yp < Yb && Yb - Yp < Barrier.height) {
                        collided = true;
                    }
                }
                else if(Xp < Xb && Xb - Xp < Barrier[k].width) {
                    if(Yp > Yb && Yp - Yb < Bullets[i][j].height) {
                        collided = true;
                    }
                    else if(Yp < Yb && Yb - Yp < Barrier[k].height) {
                        collided = true;
                    }
                }

                if(collided) {
                    healthBarrier[i] = Math.max(0, healthBarrier[i] - 1);
                    Bullets[i][j].y = HEIGHT + 5;
                }

                if(healthBarrier[k] === 0) {
                    healthBarrier[k] = -10;
                    app.stage.removeChild(Barrier[k]);
                }
            }
        }
    }

    if(Bullets.length) {
        while(Bullets[0].length && Bullets[0][0].y >= HEIGHT) {
            Bullets[0].shift();
            app.stage.removeChild(Bullets[0][0]);
        }

        if(!Bullets[0].length) {
            Bullets.shift();
        }
    }

    if(tickCount === MAX_TICK_COUNT) {
        graphics.beginFill(0x080807);
        graphics.drawRect(8, 8, 104, 34);
        graphics.endFill();
        graphics.beginFill(0xfc2403);
        graphics.drawRect(10, 10, HealthX, 30);
        graphics.endFill();
        graphics.beginFill(0xffffff);
        graphics.drawRect(HealthX + 10, 10, 100 - HealthX, 30);
        graphics.endFill();
        tickCount = 0;

        console.log(Bullets.length);
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

function GameObject(posX, posY, scale, imgBuff) {
    let gameObj = new PIXI.Texture.from(imgBuff);
    let sprite = new PIXI.Sprite.from(gameObj);

    sprite.setTransform(0, 0, scale, scale, 0, 0, 0, 0, 0);
    sprite.x = posX;
    sprite.y = posY;

    return sprite;
}

function generateLevel() {
    const nEnemies = 10; //myRandom(5, 15);

    console.log(nEnemies);

    for(let i = 0; i < nEnemies; ++i) {
        if(myRandom(0, 1)) {
            faceEast.push(true);
            Enemies.push(GameObject(myRandom(10, WIDTH - 50), myRandom(50, 150), 0.2, enemyBuffImgE));
        } else {
            faceEast.push(false);
            Enemies.push(GameObject(myRandom(10, WIDTH - 50), myRandom(50, 150), 0.2, enemyBuffImgW));
        }
    }

    let nBarriers = myRandom(5, 10);
    for(let i = 0; i < nBarriers; ++i) {
        var newBarrier = GameObject(myRandom(10, WIDTH - 10), myRandom(HEIGHT - 200, HEIGHT - 100), 0.2, barrierBuffImg);
        app.stage.addChild(newBarrier);
        Barrier.push(newBarrier);
        healthBarrier.push(5);
    }
}

function playerMov(event) {
    // console.log(window.screen.width  + ' ' + window.devicePixelRatio);
    // console.log(event.x + ' ' + event.y);
    // console.log(player.x + ' ' + player.y);

    var x = event.x;

    if(player.x > x) {
        playerMoves = Math.ceil((player.x - x)/5);
        playerDirection = 'left';
    }
    else {
        playerMoves = Math.ceil((x - player.x)/5);
        playerDirection = 'right';
    }
}

function playerMovKey(event) {
    // console.log(window.screen.width  + ' ' + window.devicePixelRatio);
    // console.log(event.x + ' ' + event.y);
    // console.log(player.x + ' ' + player.y);

    var x = event.key;

    if(x === 'ArrowLeft') {
        player.x = Math.max(0, player.x - 15);
        playerDirection = 'left';
    }
    else {
        player.x = Math.min(WIDTH, player.x + 15);
        playerDirection = 'right';
    }

}

function startGame() {
    isHelipRunning = true;
    document.getElementById("start-button").style.visibility = "hidden";
    document.getElementById("game-frame").appendChild(app.view);
    app.stage.addChild(player);

    generateLevel();

    for(let i = 0; i < Enemies.length; ++i) {
        app.stage.addChild(Enemies[i]);
    }

    graphics.beginFill(0x080807);
    graphics.drawRect(8, 8, 104, 34);
    graphics.endFill();
    graphics.beginFill(0xfc2403);
    graphics.drawRect(10, 10, 100, 30);
    graphics.endFill();

    app.stage.addChild(graphics);
}

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  if(isHelipRunning) {
    tick();
  }
});
