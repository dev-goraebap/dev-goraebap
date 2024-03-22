import * as Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {

    private readonly _speed = 80;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.physics.add.existing(this, false);
    }

    get speed() {
        return this._speed;
    }
}