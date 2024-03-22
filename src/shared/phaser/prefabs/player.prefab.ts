export interface IPlayerControlStrategy {
    onControl(): void;
}

export class DuckControl implements IPlayerControlStrategy {

    private speed: number;
    private keyboard: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(
        private readonly player: PlayerPrefab
    ) { 
        this.speed = player.getSpeed();
        this.keyboard = player.scene.input.keyboard!.createCursorKeys();
    }

    onControl() {
        this.player.setVelocity(0);
        
        if (this.keyboard.left.isUp && this.keyboard.right.isUp && this.keyboard.up.isUp && this.keyboard.down.isUp) {
            this.player.anims.play('bird-idle', true);
		}
        
        this.player.anims.play('bird-move', true);

			
		if (this.keyboard.right.isDown && this.keyboard.up.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocity(this.speed / 2, -this.speed / 2);
		} else if (this.keyboard.left.isDown && this.keyboard.down.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocity(-this.speed / 2, this.speed / 2);
		} else if (this.keyboard.right.isDown && this.keyboard.down.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocity(this.speed / 2, this.speed / 2);
		} else if (this.keyboard.left.isDown && this.keyboard.up.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocity(-this.speed / 2, -this.speed / 2);
		} 
        
		if (this.keyboard.left.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocityX(-this.speed);
		} else if (this.keyboard.right.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocityX(this.speed);
		} else if (this.keyboard.up.isDown) {
            this.player.setVelocityY(-this.speed);
		} else if (this.keyboard.down.isDown) {
            this.player.setVelocityY(this.speed);
		} 
    }
}

export class PlayerPrefab extends Phaser.Physics.Arcade.Sprite {

    private speed = 80;
    private controlStrategy?: IPlayerControlStrategy;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }

    getSpeed() {
        return this.speed;
    }

    setControl(controlStrategy: IPlayerControlStrategy) {
        this.controlStrategy = controlStrategy;
    }

    onControl() {
        if (!this.controlStrategy) {
            throw new Error('controlStrategy is not set');
        }

        this.controlStrategy.onControl();
    }
}