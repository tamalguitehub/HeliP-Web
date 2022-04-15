function GameObject(posX, posY, imgurl) {
    let gameObj = new PIXI.Texture.from(imgurl);
    let sprite = PIXI.Sprite.from(gameObj);

    sprite.setTransform(0, 0, 0.2, 0.2, 0, 0, 0, 0, 0);

    return sprite;
}
