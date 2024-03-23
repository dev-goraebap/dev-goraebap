import * as Phaser from 'phaser';
import { ComputerAnims, ComputerSprite } from '../constants';
import { InteractiveObjectPrefab } from './interactive-object.prefab';

export class ComputerPrefab extends InteractiveObjectPrefab {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ComputerSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0, 0);
        this.setBodySize(this.width-6, 13);
        this.setOffset(18, 30);
        this.setDepth(1);
    }

    onSelected(): void {
        this.anims.play(ComputerAnims.Select);
    }

    onDeselected(): void {
        this.anims.play(ComputerAnims.Idle);
    }
}