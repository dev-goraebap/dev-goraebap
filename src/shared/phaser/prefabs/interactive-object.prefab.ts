import * as Phaser from 'phaser';

export abstract class InteractiveObjectPrefab extends Phaser.Physics.Arcade.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }

    abstract onSelected(): void;

    abstract onDeselected(): void;
}