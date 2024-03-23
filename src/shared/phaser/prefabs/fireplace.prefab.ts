import * as Phaser from 'phaser';
import { FireplaceSprite } from '../constants';

export class FireplacePrefab extends Phaser.GameObjects.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, FireplaceSprite);

        scene.add.existing(this);

        this.setOrigin(0, 0);
        this.anims.play('fireplaceIdle', true);
        this.setDepth(1);
    }
}