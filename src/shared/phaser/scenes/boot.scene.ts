import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {

    constructor() {
        super('Boot');
    }

    preload() {
        console.log('BootScene preload');
        this.load.pack('pack', 'app/assets/phaser/asset-pack.json');
    }

    create() {
        console.log('BootScene create');
        this.scene.start('Test');
    }
}