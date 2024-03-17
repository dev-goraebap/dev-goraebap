import { Scene } from 'phaser';

export class MainScene extends Scene {

    cursors: any;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'app/assets/tilemaps/map01.tmj');
        this.load.image('tiles', 'app/assets/tilemaps/map01.png');

        this.load.spritesheet('computer', 'app/assets/sprites/computer.png', {
            frameWidth: 32, // 프레임의 너비
            frameHeight: 33 // 프레임의 높이
        });
        this.load.spritesheet('bookTable', 'app/assets/sprites/book-table.png', {
            frameWidth: 27, // 프레임의 너비
            frameHeight: 42 // 프레임의 높이
        });
        this.load.spritesheet('gameMachine', 'app/assets/sprites/game-machine.png', {
            frameWidth: 19, // 프레임의 너비
            frameHeight: 37 // 프레임의 높이
        });
        this.load.spritesheet('piano', 'app/assets/sprites/piano.png', {
            frameWidth: 33, // 프레임의 너비
            frameHeight: 16 // 프레임의 높이
        });
        this.load.animation('animations', 'app/assets/anims/animations.json');
    }

    create() {
        const tilemap = this.add.tilemap('map');
        const tiles = tilemap.addTilesetImage("map01", "tiles")!;
        tilemap.createLayer("Main", tiles, 0, 0)!;
        tilemap.createLayer("Wall", tiles, 0, 0)!;
        tilemap.createLayer("Rug", tiles, 0, 0)!;
        tilemap.createLayer("PlayStation", tiles, 0, 0)!;
        tilemap.createLayer("Fireplace", tiles, 0, 0)!;
        tilemap.createLayer("StaticObjects", tiles, 0, 0)!;
        tilemap.createLayer("Bed", tiles, 0, 0)!;
        tilemap.createLayer("Wall2", tiles, 0, 0)!;

        const objectsLayer = tilemap.getObjectLayer("Objects")!.objects as any[];
        let computerObj: any;
        let bookTableObj: any;
        let gameMachineObj: any;
        let pianoObj: any;

        objectsLayer.forEach(obj => {
            if (obj.name === "computer") computerObj = obj;
            if (obj.name === "book-table") bookTableObj = obj;
            if (obj.name === "game-machine") gameMachineObj = obj;
            if (obj.name === "piano") pianoObj = obj;
        });

        const computer = this.physics.add.sprite(computerObj.x, computerObj.y, 'computer');
        computer.setOrigin(0, 0);
        computer.setInteractive();
        computer.on('pointerover', () => {
            computer.anims.play('computer-hover');
            this.input.setDefaultCursor('pointer');
        });
        computer.on('pointerout', () => {
            computer.anims.play('computer-idle');
            this.input.setDefaultCursor('default');
        });


        const bookTable = this.physics.add.sprite(bookTableObj.x, bookTableObj.y, 'bookTable');
        bookTable.setOrigin(0, 0);
        bookTable.setInteractive();
        bookTable.on('pointerover', () => {
            bookTable.anims.play('book-table-hover');
            this.input.setDefaultCursor('pointer');
        });
        bookTable.on('pointerout', () => {
            bookTable.anims.play('book-table-idle');
            this.input.setDefaultCursor('default');
        });

        const gameMachine = this.physics.add.sprite(gameMachineObj.x, gameMachineObj.y, 'gameMachine');
        gameMachine.setOrigin(0, 0);
        gameMachine.setInteractive();
        gameMachine.on('pointerover', () => {
            gameMachine.anims.play('game-machine-hover');
            this.input.setDefaultCursor('pointer');
        });
        gameMachine.on('pointerout', () => {
            gameMachine.anims.play('game-machine-idle');
            this.input.setDefaultCursor('default');
        });

        const piano = this.physics.add.sprite(pianoObj.x, pianoObj.y, 'piano');
        piano.setOrigin(0, 0);
        piano.setInteractive();
        piano.on('pointerover', () => {
            piano.anims.play('piano-hover');
            this.input.setDefaultCursor('pointer');
        });
        piano.on('pointerout', () => {
            piano.anims.play('piano-idle');
            this.input.setDefaultCursor('default');
        });


        this.cameras.main.setZoom(3);
        this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    override update() {
        if (this.cursors.left.isDown) {
            this.cameras.main.x -= 4;
        }
        else if (this.cursors.right.isDown) {
            this.cameras.main.x += 4;
        }

        if (this.cursors.up.isDown) {
            this.cameras.main.y -= 4;
        }
        else if (this.cursors.down.isDown) {
            this.cameras.main.y += 4;
        }
    }
}