var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyvcoBYjFEF0Z2mD'}).base('appY7E1lqNol7GdKF');

const WIDTH = window.innerWidth;
const HEIGHT = 600;

const ENEMY_SPEED = 5;
const BULLET_SPEED = 5;
const MEDIC_SPEED = 2;
const PLAYER_SPEED = 10;

let DP = [[8,	13,	1800,	100],
[10,	5,	1725,	150],
[12,	6,	1650,	200],
[14,	8,	1575,	250],
[16,	9,	1500,	300],
[18,	9,	1425,	350],
[20,	10,	1350,	400],
[22,	11,	1275,	450],
[24,	12,	1200,	500],
[26,	12,	1125,	550],
[28,	13,	1050,	600],
[30,	14,	975,	650],
[32,	15,	900,	700],
[34,	16,	825,	750],
[36,	16,	750,	800],
[38,	17,	675,	850],
[40,	17,	600,	900],
[42,	18,	525,	950],
[44,	19,	450,	1000],
[46,	20,	375,	1050]];

let DiffParamID = ['reck74mcMODSDe0S2',
'recYA1uBJSHKAQliI',
'recZl7pigTxIMqNfg',
'recrRRnwCFlilTvxk',
'recgjFwMmRCsNqmBD',
'recCKlKDEHdQs0DIY',
'recJsauYdjYwEYgQu',
'recC9hjNL3uiamTzf',
'rec5P24AfSctFIl8b',
'rec8t8M3Y2Plbu07Z',
'recf6Qna9SSC6AVWa',
'recmPKdgr3bUTuNIO',
'recrHSE8rBidGykgC',
'recCA45vAcsNQa5mX',
'recMb8OIAIy8BO6Vh',
'recvzdRIjbgLzLl8x',
'rec0JjtGNqKhkpVcD',
'rectWRWBmdnvWAUfZ',
'recp5am6OylTdq3mq',
'recE6b8gWFGgek4dW'];

// Adding Mouse Click Listener for the game
document.addEventListener('click', playerMov);

// Adding Keyboard Listener for the game
document.addEventListener('keydown', playerMovKey);

// Main Game App
let app = new PIXI.Application({ width: WIDTH, height: HEIGHT, backgroundColor: 0xfae13c});

let graphics = new PIXI.Graphics();

let isHelipRunning = false;

let playerRight = PIXI.BaseTexture.from('Icons/player256-fl.png');
let playerLeft = PIXI.BaseTexture.from('Icons/player256-fr.png');

let enemyBuffImgW = PIXI.BaseTexture.from('Icons/enemy-helicopter256-fl.png');
let enemyBuffImgE = PIXI.BaseTexture.from('Icons/enemy-helicopter256-fr.png');

let bulletBuffImg = PIXI.BaseTexture.from('Icons/bullet256-fd.png');
let medicBuffImg = PIXI.BaseTexture.from('Icons/pharmacy256.png');
let barrierBuffImg = PIXI.BaseTexture.from('Icons/barrier256.png');

const BULLET_DROP_PROB = 1500;
const MEDIC_DROP_PROB = 1000;

let playerMoves = 0;

let tickCount = 0;
const MAX_TICK_COUNT = 60;

let levelTimer = 0;
const MAX_LEVEL_TIMER = 15;

let score = 0;

let scoreText = new PIXI.Text("Score : " + score.toString());
scoreText.x = WIDTH - 200;
scoreText.y = 15;

const style = new PIXI.TextStyle({fill: "#ff2600"});
healthText = new PIXI.Text('100', style);
healthText.x = 130;
healthText.y = 10;

function tick() {
    if(level.healthPlayer <= 0) {
        isHelipRunning = false;
        endGame();
    }

    level.tick();

    tickCount++;

    if(tickCount === MAX_TICK_COUNT) {
        level.generateBullet();
        level.generateMedic();

        graphics.beginFill(0x080807);
        graphics.drawRect(8, 8, 104, 34);
        graphics.endFill();
        graphics.beginFill(0xfc2403);
        graphics.drawRect(10, 10, level.healthPlayer, 30);
        graphics.endFill();
        graphics.beginFill(0xffffff);
        graphics.drawRect(level.healthPlayer + 10, 10, 100 - level.healthPlayer, 30);
        graphics.endFill();

        tickCount = 0;
        score++;
        levelTimer++;
    }

    if(levelTimer === MAX_LEVEL_TIMER) {
        isHelipRunning = false;

        if(confirm("Go to next Level")) {
            isHelipRunning = true;
            level.generateLevel();
            level.addGameObjects();
        } else {
            endGame();
        }

        levelTimer = 0;
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

class Level {
    constructor() {
        this.nEnemies = 0;
        this.nBarriers = 0;
        this.bulletDropProb = 0;
        this.helperDropProb = 0;

        this.Player = null;
        this.Enemies = [];
        this.Barriers = [];
        this.Bullets = [];
        this.Medics = [];

        this.healthPlayer = 100;
        this.faceEast = [];
        this.healthBarrier = [];
        this.playerDirection = 'Right';

        this.currLevel = 0;
    }

    generateLevel() {
        this.currLevel++;

        this.nEnemies = DP[this.currLevel - 1][0];
        this.nBarriers = DP[this.currLevel - 1][1];
        this.bulletDropProb = DP[this.currLevel - 1][2];
        this.helperDropProb = DP[this.currLevel - 1][3];

        app.stage.removeChildren(0, app.stage.children.length);

        app.stage.addChild(graphics);

        var levelText = new PIXI.Text('Level : ' + this.currLevel.toString());
        levelText.x = WIDTH/2 - 50;
        levelText.y = 15;

        app.stage.addChild(levelText);

        app.stage.addChild(scoreText);
        app.stage.addChild(healthText);

        // Generating Player
        this.Player = GameObject(WIDTH/2, HEIGHT - 50, 0.2, playerRight);

        // Generating Enemies
        for(let i = 0; i < this.nEnemies; ++i) {
            if(myRandom(0, 1)) {
                this.faceEast.push(true);
                this.Enemies.push(GameObject(myRandom(0, WIDTH), myRandom(50, 150), 0.2, enemyBuffImgE));
            } else {
                this.faceEast.push(false);
                this.Enemies.push(GameObject(myRandom(0, WIDTH), myRandom(50, 150), 0.2, enemyBuffImgW));
            }
        }

        // Generating Barriers
        for(let i = 0; i < this.nBarriers; ++i) {
            var newBarrier = GameObject(myRandom(10, WIDTH - 10), myRandom(HEIGHT - 200, HEIGHT - 100), 0.2, barrierBuffImg);
            this.Barriers.push(newBarrier);
            this.healthBarrier.push(5);
        }

        //console.log("Player : " + this.Player.width + " " + this.Player.height);
    }

    addGameObjects() {
        app.stage.addChild(this.Player);

        for(let i = 0; i < this.nEnemies; ++i) {
            app.stage.addChild(this.Enemies[i]);
        }

        for(let i = 0; i < this.nBarriers; ++i) {
            app.stage.addChild(this.Barriers[i]);
        }
    }

    generateBullet() {
        let bulletBatchGen = [];

        for(let i = 0; i < this.nEnemies; ++i) {
            if(this.bulletDropProb > myRandom(0, 2000)) {
                var newBullet = GameObject(this.Enemies[i].x, this.Enemies[i].y, 0.1, bulletBuffImg);
                //console.log("Bullet : " + newBullet.x + " " + newBullet.y + ", " + newBullet.width + " " + newBullet.height);
                bulletBatchGen.push(newBullet);
                app.stage.addChild(newBullet);
            }
        }

        if(bulletBatchGen.length) {
            this.Bullets.push(bulletBatchGen);
        }

        score += bulletBatchGen.length;
    }

    generateMedic() {
        if(this.helperDropProb > myRandom(0, 2000)) {
            var newMedic = GameObject(myRandom(10, WIDTH - 10), myRandom(50, 100), 0.1, medicBuffImg);
            this.Medics.push(newMedic);
            app.stage.addChild(newMedic);
        }
    }

    tick()
    {
        // Updating Score
        scoreText.text = 'Score : ' + score.toString();

        healthText.text = this.healthPlayer.toString();

        // Checking Collision
        for(let i = 0; i < this.Bullets.length; ++i) {
            for(let j = 0; j < this.Bullets[i].length; ++j) {
                // Bullet Player Collison
                var collidedBulletPlayer = false;

                var Px = this.Player.x;
                var Py = this.Player.y;

                var Bx = this.Bullets[i][j].x;
                var By = this.Bullets[i][j].y;

                if(Px > Bx && Px - Bx < this.Bullets[i][j].width) {
                    if(Py > By && Py - By < this.Bullets[i][j].height) {
                        collidedBulletPlayer = true;
                    }
                    else if(Py < By && By - Py < this.Player.height) {
                        collidedBulletPlayer = true;
                    }
                }
                else if(Px < Bx && Bx - Px < this.Player.width) {
                    if(Py > By && Py - By < this.Bullets[i][j].height) {
                        collidedBulletPlayer = true;
                    }
                    else if(Py < By && By - Py < this.Player.height) {
                        collidedBulletPlayer = true;
                    }
                }

                if(collidedBulletPlayer) {
                    this.healthPlayer = Math.max(0, this.healthPlayer - 5);
                    this.Bullets[i][j].y = HEIGHT + 50;
                    score--;
                }

                // Bullet Barrier Collision

                for(let k = 0; k < this.Barriers.length; ++k) {
                    if(this.healthBarrier[k]) {
                        var collidedBulletBarrier = false;

                        Px = this.Barriers[k].x;
                        Py = this.Barriers[k].y;

                        if(Px > Bx && Px - Bx < this.Bullets[i][j].width) {
                            if(Py > By && Py - By < this.Bullets[i][j].height) {
                                collidedBulletBarrier = true;
                            }
                            else if(Py < By && By - Py < this.Barriers[k].height) {
                                collidedBulletBarrier = true;
                            }
                        }
                        else if(Px < Bx && Bx - Px < this.Barriers[k].width) {
                            if(Py > By && Py - By < this.Bullets[i][j].height) {
                                collidedBulletBarrier = true;
                            }
                            else if(Py < By && By - Py < this.Barriers[k].height) {
                                collidedBulletBarrier = true;
                            }
                        }

                        if(collidedBulletBarrier) {
                            if(this.healthBarrier[k] > 0) {
                                this.healthBarrier[k] -= 1;
                                this.Bullets[i][j].y = HEIGHT + 50;
                            }
                        }
                    }
                }
            }
        }

        // Checking Healing
        for(let i = 0; i < this.Medics.length; ++i) {
            var healedMedicPlayer = false;

            var Px = this.Player.x;
            var Py = this.Player.y;

            var Bx = this.Medics[i].x;
            var By = this.Medics[i].y;

            if(Px > Bx && Px - Bx < this.Medics[i].width) {
                if(Py > By && Py - By < this.Medics[i].height) {
                    healedMedicPlayer = true;
                }
                else if(Py < By && By - Py < this.Player.height) {
                    healedMedicPlayer = true;
                }
            }
            else if(Px < Bx && Bx - Px < this.Player.width) {
                if(Py > By && Py - By < this.Medics[i].height) {
                    healedMedicPlayer = true;
                }
                else if(Py < By && By - Py < this.Player.height) {
                    healedMedicPlayer = true;
                }
            }

            if(healedMedicPlayer) {
                this.healthPlayer = Math.min(this.healthPlayer + 10, 100);
                this.Medics[i].y = HEIGHT + 50;
            }
        }

        // Enemy Tick
        for(let i = 0; i < this.nEnemies; ++i) {
            if(this.faceEast[i]) {
                if(this.Enemies[i].x + 5 > WIDTH - 30) {
                    this.faceEast[i] = false;
                    this.Enemies[i].texture = PIXI.Texture.from(enemyBuffImgW);
                    this.Enemies[i].x -= 5;
                } else {
                    this.Enemies[i].x +=  5;
                }
            }
            else {
                if(this.Enemies[i].x - 5 < 0) {
                    this.faceEast[i] = true;
                    this.Enemies[i].texture = PIXI.Texture.from(enemyBuffImgE);
                    this.Enemies[i].x += 5;
                } else {
                    this.Enemies[i].x -=  5;
                }
            }
        }

        // Bullet Tick
        if(this.Bullets.length > 4) {
            for(let i = 0; i < this.Bullets[0].length; ++i) {
                app.stage.removeChild(this.Bullets[0][i]);
            }
            this.Bullets.shift();
        }

        for(let i = 0; i < this.Bullets.length; ++i) {
            for(let j = 0; j < this.Bullets[i].length; ++j) {
                this.Bullets[i][j].y += BULLET_SPEED;
            }
        }

        // Barrier Tick
        for(let i = 0; i < this.Barriers.length; ++i) {
            if(this.healthBarrier[i] === 0) {
                app.stage.removeChild(this.Barriers[i]);
                this.healthBarrier[i] = -10;
            }
        }

        // Medic Tick
        for(let i = 0; i < this.Medics.length; ++i) {
            this.Medics[i].y += MEDIC_SPEED;
        }

        let len = this.Medics.length;
        while(len && this.Medics[0].y > HEIGHT) {
            app.stage.removeChild(this.Medics[0]);
            len--;
        }

        // Player Tick
        if(playerMoves) {
            if(level.playerDirection === 'left' && level.Player.x - 5 > 0) {
                level.Player.x -= 5;
            }
            else if(level.playerDirection === 'right' && level.Player.x + 5 < WIDTH) {
                level.Player.x += 5;
            }
            playerMoves--;
        }
    }
}

let level = null;

function playerMov(event) {
    var x = event.x;

    if(level && level.Player) {
        if(level.Player.x > x) {
            playerMoves = Math.ceil((level.Player.x - x)/5);
            level.playerDirection = 'left';
        }
        else {
            playerMoves = Math.ceil((x - level.Player.x)/5);
            level.playerDirection = 'right';
        }
    }
}

function playerMovKey(event) {
    var x = event.key;

    if(level && level.Player) {
        if(x === 'ArrowLeft') {
            level.Player.x = Math.max(0, level.Player.x - 15);
            level.playerDirection = 'left';
        }
        else if(x === 'ArrowRight') {
            level.Player.x = Math.min(WIDTH, level.Player.x + 15);
            level.playerDirection = 'right';
        }
    }
}

var UserName;

function startGame() {
    isHelipRunning = true;

    UserName = document.getElementById("name").value;
    console.log(UserName);

    document.getElementById("start-button").style.visibility = "hidden";
    document.getElementById("name").style.visibility = "hidden";

    document.body.appendChild(app.view);

    level = new Level();

    level.generateLevel();
    level.addGameObjects();

    graphics.beginFill(0x080807);
    graphics.drawRect(8, 8, 104, 34);
    graphics.endFill();
    graphics.beginFill(0xfc2403);
    graphics.drawRect(10, 10, 100, 30);
    graphics.endFill();

    app.stage.addChild(graphics);
}

function endGame() {
    app.stage.removeChildren(0, app.stage.children.length);

    /*var finalScoreText = new PIXI.Text("Final Score : " + score.toString());
    finalScoreText.x = WIDTH/2 - 50;
    finalScoreText.y = HEIGHT/2;

    app.stage.addChild(finalScoreText);
*/

    uploadScore(level.currLevel, score);
    score = 0;
    isHelipRunning = false;
    document.getElementById("start-button").style.visibility = "visible";
    document.getElementById("name").style.visibility = "visible";

    document.body.removeChild(app.view);
}

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  if(isHelipRunning) {
    tick();
  }
});

function retrieveParameters() {
    dataX = [];
    base('DiffParam').select({
        view: 'Grid view',
    }).firstPage(function(err, records) {
        if (err) { console.error(err); return; }
        records.forEach(function(record) {
            let res = [];
            res.push(record.get('nEnemies'));
            res.push(record.get('nBarriers'));
            res.push(record.get('bulletDropProb'));
            res.push(record.get('helperDropProb'));
            //console.log("Res" + res);
            dataX.push(res);
        });
    });

    console.log(dataX[1]);
}

function uploadScore(level, score) {
    if(UserName === "") {
        return;
    }
    base('ScoreData').create([
      {
        "fields": {
          "PlayerName": UserName,
          "Score": score,
          "Level": level
        }
      }
    ], function(err, records) {
      if (err) {
        console.error(err);
        return;
      }
    });
}
