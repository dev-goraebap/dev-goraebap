import * as Phaser from 'phaser';
import { PianoAnims, PianoSprite } from '../constants';
import { InteractiveObjectPrefab } from './interactive-object.prefab';

export class PianoPrefab extends InteractiveObjectPrefab {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, PianoSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0, 0);
        this.setBodySize(this.width-4, this.height/2);
        this.setOffset(this.width/2 + 2, this.height);
        this.setDepth(1);
    }

    onSelected(): void {
        this.anims.play(PianoAnims.Select);
    }

    onDeselected(): void {
        this.anims.play(PianoAnims.Idle);
    }
}