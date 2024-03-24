import * as Phaser from 'phaser';
import { GameMachineAnims, GameMachineSprite } from '../constants';
import { InteractiveObjectPrefab, InteractiveType } from './interactive-object.prefab';

export class GameMachinePrefab extends InteractiveObjectPrefab {

    protected override _eventType: InteractiveType = 'game';

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, GameMachineSprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0, 0);
        this.setBodySize(this.width-2, this.height-15);
        this.setOffset(this.width-8, this.height-5);
        this.setDepth(3);
    }

    onSelected(): void {
        this.anims.play(GameMachineAnims.Select);
    }

    onDeselected(): void {
        this.anims.play(GameMachineAnims.Idle);
    }
}