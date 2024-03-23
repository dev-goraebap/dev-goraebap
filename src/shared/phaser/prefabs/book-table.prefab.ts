import * as Phaser from 'phaser';
import { BookTableSprite } from '../constants';

export class BookTablePrefab extends Phaser.Physics.Arcade.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, BookTableSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0, 0);
        this.setBodySize(this.width-3, 20);
        this.setOffset(16, 32);
        this.setOrigin(0, 0);
        this.setDepth(1);
    }
}