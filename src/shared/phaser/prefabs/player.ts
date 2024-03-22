import * as Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {

    private readonly _speed = 80;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.physics.add.existing(this, false);

        this.setBodySize(15, 30);
        this.setOffset(10, 2);
        this.setScale(0.6);
        this.setDepth(2);
    }

    get speed() {
        return this._speed;
    }
}