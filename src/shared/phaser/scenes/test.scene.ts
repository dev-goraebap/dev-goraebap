import * as Phaser from 'phaser';

import { BookTableAnims, ComputerAnims, GameMachineAnims, PianoAnims } from '../constants';
import { BirdController } from '../controllers';
import { BirdPrefab, BookTablePrefab, ComputerPrefab, FireplacePrefab, GameMachinePrefab, PianoPrefab } from '../prefabs';

export class TestScene extends Phaser.Scene {

    private player!: BirdPrefab;
    private computer!: ComputerPrefab;
    private bookTable!: BookTablePrefab;
    private fireplace!: FireplacePrefab;
    private piano!: PianoPrefab;
    private gameMachine!: GameMachinePrefab;

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

        const objectsLayer = tilemap.getObjectLayer("objects")!.objects as any[];
        objectsLayer.forEach(obj => {
            switch (obj.name) {
                case "computer":
                    this.computer = new ComputerPrefab(this, obj.x, obj.y);
                    break;
                case "bookTable":
                    this.bookTable = new BookTablePrefab(this, obj.x, obj.y);
                    break;
                case "gameMachine":
                    this.gameMachine = new GameMachinePrefab(this, obj.x, obj.y);
                    break;
                case "piano":
                    this.piano = new PianoPrefab(this, obj.x, obj.y);
                    break;
                case "fireplace":
                    this.fireplace = new FireplacePrefab(this, obj.x, obj.y);
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

        this.physics.add.collider(this.player, this.computer);
        this.physics.add.collider(this.player, this.bookTable);
        this.physics.add.collider(this.player, this.gameMachine);
        this.physics.add.collider(this.player, this.piano);
        this.physics.add.collider(this.player, collideObjects);
    }

    override update(time: number, delta: number): void {
        this.inputHandler.update();

        if (!this.player || !this.computer || !this.bookTable ||!this.gameMachine) {
            return;
        }

        // 모든 객체에 대해 거리를 계산하고 가장 가까운 객체를 찾습니다.
        let closestObject: any = null;
        let smallestDistance = Infinity;
        const objects = [this.computer, this.bookTable, this.gameMachine, this.piano]; // 검사할 객체 배열

        objects.forEach(object => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                object.x, object.y
            );

            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestObject = object;
            }
        });

        // 가장 가까운 객체와의 거리가 일정 범위 내에 있는지 확인하고,
        // 해당 객체에만 선택 애니메이션을 적용합니다.
        objects.forEach(object => {
            if (object === closestObject && this.checkOverlap(this.player, object)) {
                if (object === this.computer) {
                    this.computer.anims.play(ComputerAnims.Select);
                } else if (object === this.bookTable) {
                    this.bookTable.anims.play(BookTableAnims.Select);
                } else if (object === this.gameMachine) {
                    this.gameMachine.anims.play(GameMachineAnims.Select);
                } else if (object === this.piano) {
                    this.piano.anims.play(PianoAnims.Select);
                }
            } else {
                // 선택되지 않은 객체는 일반 상태로 유지
                if (object === this.computer) {
                    this.computer.anims.play(ComputerAnims.Idle);
                } else if (object === this.bookTable) {
                    this.bookTable.anims.play(BookTableAnims.Idle);
                } else if (object === this.gameMachine) {
                    this.gameMachine.anims.play(GameMachineAnims.Idle);
                } else if (object === this.piano) {
                    this.piano.anims.play(PianoAnims.Idle);
                }
            }
        });
    }

    private checkOverlap(spriteA: Phaser.Physics.Arcade.Sprite, spriteB: Phaser.Physics.Arcade.Sprite) {
        const boundsA = spriteA.getBounds();
        const boundsB = spriteB.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
}