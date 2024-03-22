import * as Phaser from 'phaser';
import { InputHandler } from '../prefabs/input-handler';
import { Player } from '../prefabs/player';

export class TestScene extends Phaser.Scene { 

    private player!: Player;
    private inputHandler!: InputHandler;

    constructor() {
        super('Test');
    }

    preload() {
        console.log('TestScene preload');
    }

    create() {
        console.log('TestScene create');

        this.player = new Player(this, 400, 300, 'birdSprite');
        this.add.existing(this.player);

        const cursorKeys = this.input.keyboard!.createCursorKeys();
        this.inputHandler = new InputHandler(cursorKeys, this.player);
    }

    override update(time: number, delta: number): void {
        this.inputHandler.update();
    }
}