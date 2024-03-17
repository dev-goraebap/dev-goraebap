import Phaser from "phaser";
import { MainScene } from "./scenes/main.scene";

export const startGame = (canvas: HTMLCanvasElement) => {
    return new Phaser.Game({
        canvas,
        type: Phaser.CANVAS,
        scene: [MainScene],
        transparent: true,
        render: {
            pixelArt: true // Nearest-Neighbor 필터링 활성화
        },
        physics: {
            default: "arcade",
            arcade: {
                // gravity: { y: 0 },
                // debug: true
            }
        }
    });
}

