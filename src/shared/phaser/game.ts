import Phaser from "phaser";
import { BootScene } from "./scenes/boot.scene";
import { MainScene } from "./scenes/main.scene";
import { TestScene } from "./scenes/test.scene";

export const startGame = (canvas: HTMLCanvasElement) => {
    return new Phaser.Game({
        canvas,
        type: Phaser.CANVAS,
        scene: [BootScene, TestScene, MainScene],
        // transparent: true,
        render: {
            pixelArt: true // Nearest-Neighbor 필터링 활성화
        },
        physics: {
            default: "arcade",
            arcade: {
                // gravity: { y: 0 },
                debug: true
            }
        }
    });
}

