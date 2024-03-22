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
        // 타일맵 설정
        const tilemap = this.add.tilemap('tilemap');
        const tiles = tilemap.addTilesetImage('tilemap-main', 'tilemapAssets')!;
        tilemap.createLayer('staticLayer1', tiles);
        tilemap.createLayer('staticLayer2', tiles);
        tilemap.createLayer('staticLayer3', tiles);
        tilemap.createLayer('staticLayer4', tiles);
        tilemap.createLayer('staticLayer5', tiles);

        // 타일맵 오브젝트 설정

        let computer!: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
        let bookTable!: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
        let gameMachine!: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
        let piano!: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
        let fireplace!: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

        const objectsLayer = tilemap.getObjectLayer("objects")!.objects as any[];
        objectsLayer.forEach(obj => {
            switch (obj.name) {
                case "computer":
                    computer = this.physics.add.staticSprite(obj.x, obj.y, 'computerSprite');
                    computer.setOrigin(0, 0);
                    computer.setBodySize(computer.width-6, 13);
                    computer.setOffset(18, 30);
                    computer.setDepth(1);
                    computer.setInteractive();
                    computer.on('pointerover', () => {
                        computer.anims.play('computerSelect');
                        this.input.setDefaultCursor('pointer');
                    });
                    computer.on('pointerout', () => {
                        computer.anims.play('computerIdle');
                        this.input.setDefaultCursor('default');
                    });
                    break;
                case "bookTable":
                    bookTable = this.physics.add.staticSprite(obj.x, obj.y, 'bookTableSprite');
                    bookTable.setOrigin(0, 0);
                    bookTable.setBodySize(bookTable.width-3, 20);
                    bookTable.setOffset(16, 32);
                    bookTable.setOrigin(0, 0);
                    bookTable.setDepth(1);
                    break;
                case "gameMachine":
                    gameMachine = this.physics.add.staticSprite(obj.x, obj.y, 'gameMachineSprite');
                    gameMachine.setOrigin(0, 0);
                    gameMachine.setDepth(3);
                    break;
                case "piano":
                    piano = this.physics.add.staticSprite(obj.x, obj.y, 'pianoSprite');
                    piano.setOrigin(0, 0);
                    piano.setDepth(1);
                    break;
                case "fireplace":
                    fireplace = this.physics.add.staticSprite(obj.x, obj.y, 'fireplaceSprite');
                    fireplace.setOrigin(0, 0);
                    fireplace.anims.play('fireplaceIdle', true);
                    fireplace.setDepth(1);
                    break;
                case "spawn":
                    this.player = new Player(this, obj.x, obj.y, 'birdSprite');
                    this.add.existing(this.player);
                    break;
                default:
            }
        });

        const collideObjectsLayer = tilemap.createFromObjects('collideObjects', { classType: Phaser.Physics.Arcade.Image });
		this.physics.world.enable(collideObjectsLayer);
        collideObjectsLayer.forEach(obj => {
			const arcadeObj = obj as Phaser.Physics.Arcade.Image;
			arcadeObj.setSize(arcadeObj.width, arcadeObj.height); // 오브젝트의 넓이 높이값 적용
			arcadeObj.setImmovable(true); // 오브젝트를 정적으로 설정 -> 안해주면 충돌시 가속도, 무게에 비례해서 튕겨나감
			arcadeObj.setVisible(false); // 충돌 오브젝트들은 타일맵이 아니라 도형을 이용해서 만듬 -> 보여줄 필요 없음
        });

        this.physics.add.collider(this.player, computer);
        this.physics.add.collider(this.player, bookTable);
        this.physics.add.collider(this.player, collideObjectsLayer);

        // 키보드 입력 처리
        const cursorKeys = this.input.keyboard!.createCursorKeys();
        this.inputHandler = new InputHandler(cursorKeys, this.player);

        // 맵의 크기
        const mapWidth = tilemap.widthInPixels;
        const mapHeight = tilemap.heightInPixels;

        // 화면 크기
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // 맵을 화면 정중앙에 배치하기 위한 카메라 위치 조정
        this.cameras.main.scrollX = (mapWidth - screenWidth) / 2;
        this.cameras.main.scrollY = (mapHeight - screenHeight) / 2;

        this.cameras.main.setZoom(3);
    }

    override update(time: number, delta: number): void {
        this.inputHandler.update();
    }
}