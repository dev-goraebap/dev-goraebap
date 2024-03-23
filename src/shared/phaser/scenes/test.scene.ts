import * as Phaser from 'phaser';

import { BirdController } from '../controllers';
import { BirdPrefab, BookTablePrefab, ComputerPrefab, FireplacePrefab, GameMachinePrefab, PianoPrefab } from '../prefabs';
import { ComputerAnims } from '../constants';

export class TestScene extends Phaser.Scene {

    private player!: BirdPrefab;
    private inputHandler!: BirdController;

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

        // 타일맵 정 중앙에 배치
        const mapWidth = tilemap.widthInPixels;
        const mapHeight = tilemap.heightInPixels;
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        this.cameras.main.scrollX = (mapWidth - screenWidth) / 2;
        this.cameras.main.scrollY = (mapHeight - screenHeight) / 2;
        this.cameras.main.setZoom(3);

        // 타일맵 오브젝트 설정
        let computer!: Phaser.Physics.Arcade.Sprite;
        let bookTable!: Phaser.Physics.Arcade.Sprite;
        let gameMachine!: Phaser.Physics.Arcade.Sprite;
        let piano!: Phaser.Physics.Arcade.Sprite;
        let fireplace!: Phaser.GameObjects.Sprite;

        const objectsLayer = tilemap.getObjectLayer("objects")!.objects as any[];
        objectsLayer.forEach(obj => {
            switch (obj.name) {
                case "computer":
                    computer = new ComputerPrefab(this, obj.x, obj.y);
                    break;
                case "bookTable":
                    bookTable = new BookTablePrefab(this, obj.x, obj.y);
                    break;
                case "gameMachine":
                    gameMachine = new GameMachinePrefab(this, obj.x, obj.y);
                    break;
                case "piano":
                    piano = new PianoPrefab(this, obj.x, obj.y);
                    break;
                case "fireplace":
                    fireplace = new FireplacePrefab(this, obj.x, obj.y);
                    break;
                case "spawn":
                    this.player = new BirdPrefab(this, obj.x, obj.y);
                    const cursorKeys = this.input.keyboard!.createCursorKeys();
                    this.inputHandler = new BirdController(cursorKeys, this.player);
                    break;
                default:
            }
        });

        const collideObjects = tilemap.createFromObjects('collideObjects', { classType: Phaser.Physics.Arcade.Image });
        this.physics.world.enable(collideObjects);
        collideObjects.forEach(obj => {
            const arcadeObj = obj as Phaser.Physics.Arcade.Image;
            arcadeObj.setSize(arcadeObj.width, arcadeObj.height); // 오브젝트의 넓이 높이값 적용
            arcadeObj.setImmovable(true); // 오브젝트를 정적으로 설정 -> 안해주면 충돌시 가속도, 무게에 비례해서 튕겨나감
            arcadeObj.setVisible(false); // 충돌 오브젝트들은 타일맵이 아니라 도형을 이용해서 만듬 -> 보여줄 필요 없음
        });

        this.physics.add.collider(this.player, computer, (a: any, b: any) => {
            console.log(a);
            console.log(b);
            b.anims.play(ComputerAnims.Select);
        });
        this.physics.add.collider(this.player, bookTable);
        this.physics.add.collider(this.player, gameMachine);
        this.physics.add.collider(this.player, piano);
        this.physics.add.collider(this.player, collideObjects);
    }

    override update(time: number, delta: number): void {
        this.inputHandler.update();
    }
}