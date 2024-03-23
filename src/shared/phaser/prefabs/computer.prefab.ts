import * as Phaser from 'phaser';
import { ComputerSprite } from '../constants';

export class ComputerPrefab extends Phaser.Physics.Arcade.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ComputerSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0, 0);
        this.setBodySize(this.width-6, 13);
        this.setOffset(18, 30);
        this.setDepth(1);
    }
}