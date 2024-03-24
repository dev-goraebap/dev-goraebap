import * as Phaser from 'phaser';
import { BirdSprite } from '../constants';

export class BirdPrefab extends Phaser.Physics.Arcade.Sprite {

    private readonly _speed = 80;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, BirdSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, false);

        this.setBodySize(15, 30);
        this.setOffset(10, 2);
        this.setScale(0.5);
        this.setDepth(2);
    }

    get speed() {
        return this._speed;
    }
}