import { EventType } from "@angular/router";
import { InteractiveEventHandler } from "../events";
import { InteractiveObjectPrefab } from "../prefabs";

export class InteractiveObjectController {

    private frameCount = 0;
    private currentOverlapObject: InteractiveObjectPrefab | null = null; // 현재 오버랩 중인 오브젝트를 저장

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly player: Phaser.Physics.Arcade.Sprite,
        private readonly objects: InteractiveObjectPrefab[]
    ) {
        this.scene.input.keyboard!.on('keydown-SPACE', () => {
            if (!this.currentOverlapObject) return;
            const eventHandler = InteractiveEventHandler.getInstance();
            eventHandler.publish(this.currentOverlapObject.eventType);

            // 이 때 모든 키보드 이벤트를 안되게 멈추게 해줘

            eventHandler.finished$.subscribe((eventType) => {
                // 이 때 원상복구

            });
        }, this);
    }

    update() {
        this.frameCount++;
    
        if (this.frameCount % 10 !== 0) {
            return;
        }
    
        const closestObject = this.findClosestOverlappingObject();
    
        if (closestObject) {
            this.selectObject(closestObject);
        } else {
            this.deselectCurrentObject();
        }
    }
    
    private findClosestOverlappingObject(): InteractiveObjectPrefab | null {
        let closestObject: InteractiveObjectPrefab | null = null;
        let smallestDistance = Infinity;
    
        this.objects.forEach(object => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, object.x, object.y);
            if (distance < smallestDistance && this.checkOverlap(this.player, object)) {
                smallestDistance = distance;
                closestObject = object;
            }
        });
    
        return closestObject;
    }
    
    private selectObject(object: InteractiveObjectPrefab): void {
        if (this.currentOverlapObject !== object) {
            this.deselectCurrentObject();
            object.onSelected();
            this.currentOverlapObject = object;
        }
    }
    
    private deselectCurrentObject(): void {
        if (this.currentOverlapObject) {
            this.currentOverlapObject.onDeselected();
            this.currentOverlapObject = null;
        }
    }

    private checkOverlap(spriteA: Phaser.Physics.Arcade.Sprite, spriteB: Phaser.Physics.Arcade.Sprite) {
        const boundsA = spriteA.getBounds();
        const boundsB = spriteB.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
}