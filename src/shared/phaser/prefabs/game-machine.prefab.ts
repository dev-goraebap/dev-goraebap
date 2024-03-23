import * as Phaser from 'phaser';
import { GameMachineSprite } from '../constants';

export class GameMachinePrefab extends Phaser.Physics.Arcade.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, GameMachineSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0, 0);
        this.setBodySize(this.width-2, this.height-15);
        this.setOffset(this.width-8, this.height-5);
        this.setDepth(3);
    }
}