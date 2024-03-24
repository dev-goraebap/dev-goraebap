import * as Phaser from 'phaser';
import { BookTableAnims, BookTableSprite } from '../constants';
import { InteractiveObjectPrefab, InteractiveType } from './interactive-object.prefab';

export class BookTablePrefab extends InteractiveObjectPrefab {

    protected override _eventType: InteractiveType = 'post';

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

    onSelected(): void {
        this.anims.play(BookTableAnims.Select);
    }

    onDeselected(): void {
        this.anims.play(BookTableAnims.Idle);
    }
}