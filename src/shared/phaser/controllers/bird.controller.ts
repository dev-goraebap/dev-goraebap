import * as Phaser from 'phaser';

import { BirdAnims } from '../constants';
import { BirdPrefab } from '../prefabs/bird.prefab';

export class BirdController {

      constructor(
            private readonly keyboard: Phaser.Types.Input.Keyboard.CursorKeys,
            private readonly player: BirdPrefab
      ) { }

      update() {
            if (!this.player.active) return;

            this.player.setVelocity(0);

            if (this.keyboard.left.isUp && this.keyboard.right.isUp && this.keyboard.up.isUp && this.keyboard.down.isUp) {
                  this.player.anims.play(BirdAnims.Idle, true);
            }

            this.player.anims.play(BirdAnims.Move, true);

            if (this.keyboard.right.isDown && this.keyboard.up.isDown) {
                  this.player.setFlipX(false);
                  this.player.setVelocity(this.player.speed / 2, -this.player.speed / 2);
            } else if (this.keyboard.left.isDown && this.keyboard.down.isDown) {
                  this.player.setFlipX(true);
                  this.player.setVelocity(-this.player.speed / 2, this.player.speed / 2);
            } else if (this.keyboard.right.isDown && this.keyboard.down.isDown) {
                  this.player.setFlipX(false);
                  this.player.setVelocity(this.player.speed / 2, this.player.speed / 2);
            } else if (this.keyboard.left.isDown && this.keyboard.up.isDown) {
                  this.player.setFlipX(true);
                  this.player.setVelocity(-this.player.speed / 2, -this.player.speed / 2);
            }

            if (this.keyboard.left.isDown) {
                  this.player.setFlipX(true);
                  this.player.setVelocityX(-this.player.speed);
            } else if (this.keyboard.right.isDown) {
                  this.player.setFlipX(false);
                  this.player.setVelocityX(this.player.speed);
            } else if (this.keyboard.up.isDown) {
                  this.player.setVelocityY(-this.player.speed);
            } else if (this.keyboard.down.isDown) {
                  this.player.setVelocityY(this.player.speed);
            }
      }
}