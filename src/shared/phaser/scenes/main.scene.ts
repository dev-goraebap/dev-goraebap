import { Scene } from 'phaser';

export class MainScene extends Scene {
    
    private player!: Phaser.Physics.Arcade.Sprite;
    private playerSpeed = 80;

    private leftKey!: Phaser.Input.Keyboard.Key;
	private rightKey!: Phaser.Input.Keyboard.Key;
	private upKey!: Phaser.Input.Keyboard.Key;
	private downKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'app/assets/tilemaps/map01.tmj');
        this.load.image('tiles', 'app/assets/tilemaps/map01.png');

        this.load.spritesheet('computer', 'app/assets/sprites/computer.png', {
            frameWidth: 32,
            frameHeight: 33
        });
        this.load.spritesheet('bookTable', 'app/assets/sprites/book-table.png', {
            frameWidth: 27,
            frameHeight: 42
        });
        this.load.spritesheet('gameMachine', 'app/assets/sprites/game-machine.png', {
            frameWidth: 19,
            frameHeight: 37
        });
        this.load.spritesheet('piano', 'app/assets/sprites/piano.png', {
            frameWidth: 33,
            frameHeight: 16
        });
        this.load.spritesheet('bird', 'app/assets/sprites/bird.png', {
            frameWidth: 32,
            frameHeight: 34
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
        let spawnObj: any;

        objectsLayer.forEach(obj => {
            if (obj.name === "computer") computerObj = obj;
            if (obj.name === "book-table") bookTableObj = obj;
            if (obj.name === "game-machine") gameMachineObj = obj;
            if (obj.name === "piano") pianoObj = obj;
            if (obj.name === "spawn") spawnObj = obj;
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

        this.player = this.physics.add.sprite(spawnObj.x, spawnObj.y, 'bird');
        this.player.setDisplaySize(16, 16);
        this.player.anims.play('bird-idle');

        const collideObjectsLayer = tilemap.createFromObjects('CollideObjects', { classType: Phaser.Physics.Arcade.Image });
		this.physics.world.enable(collideObjectsLayer);
        collideObjectsLayer.forEach(obj => {
			const arcadeObj = obj as Phaser.Physics.Arcade.Image;
			arcadeObj.setSize(arcadeObj.width, arcadeObj.height); // 오브젝트의 넓이 높이값 적용
			arcadeObj.setImmovable(true); // 오브젝트를 정적으로 설정 -> 안해주면 충돌시 가속도, 무게에 비례해서 튕겨나감
			arcadeObj.setVisible(false); // 충돌 오브젝트들은 타일맵이 아니라 도형을 이용해서 만듬 -> 보여줄 필요 없음
        });

        this.physics.add.collider(this.player, collideObjectsLayer);

        // 맵의 크기
        const mapWidth = tilemap.widthInPixels;
        const mapHeight = tilemap.heightInPixels;

        // 화면 크기
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // 맵을 화면 정중앙에 배치하기 위한 카메라 위치 조정
        this.cameras.main.scrollX = (mapWidth - screenWidth) / 2;
        this.cameras.main.scrollY = (mapHeight - screenHeight) / 2;
        this.cameras.main.setZoom(2);

		this.leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    override update() {
        if (!this.player) {
            return;
        }

        this.player.setVelocity(0);
        
        if (this.leftKey.isUp && this.rightKey.isUp && this.upKey.isUp && this.downKey.isUp) {
            this.player.anims.play('bird-idle', true);
		}
        
        this.player.anims.play('bird-move', true);

			
		if (this.rightKey.isDown && this.upKey.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocity(this.playerSpeed / 2, -this.playerSpeed / 2);
		} else if (this.leftKey.isDown && this.downKey.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocity(-this.playerSpeed / 2, this.playerSpeed / 2);
		} else if (this.rightKey.isDown && this.downKey.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocity(this.playerSpeed / 2, this.playerSpeed / 2);
		} else if (this.leftKey.isDown && this.upKey.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocity(-this.playerSpeed / 2, -this.playerSpeed / 2);
		} 
        
		if (this.leftKey.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocityX(-this.playerSpeed);
		} else if (this.rightKey.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocityX(this.playerSpeed);
		} else if (this.upKey.isDown) {
            this.player.setVelocityY(-this.playerSpeed);
		} else if (this.downKey.isDown) {
            this.player.setVelocityY(this.playerSpeed);
		} 
    }
}