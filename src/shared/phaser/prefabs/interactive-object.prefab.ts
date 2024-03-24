import * as Phaser from 'phaser';

export enum InteractiveTypes {
    Post = 'post',
    Portfolio = 'portfolio',
    Music ='music',
    Game = 'game'
}

export type InteractiveType = `${InteractiveTypes}`;

export abstract class InteractiveObjectPrefab extends Phaser.Physics.Arcade.Sprite {

    protected abstract _eventType: InteractiveType;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }

    get eventType(): InteractiveType {
        return this._eventType;
    }

    abstract onSelected(): void;

    abstract onDeselected(): void;
}