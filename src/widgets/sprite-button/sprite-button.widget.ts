import { Component, Input } from "@angular/core";
import { SpriteButtonKeys, SpriteResources } from "./sprites";

@Component({
    selector: "app-sprite-button",
    templateUrl: "./sprite-button.widget.html",
    standalone: true
})
export class SpriteButtonWidget {

    @Input() key!: SpriteButtonKeys;

    isClicked = false;

    readonly spriteButtonMap = new Map<SpriteButtonKeys, [string, string]>();

    constructor() {
        this.spriteButtonMap.set('a', [SpriteResources.A, SpriteResources.A_CLICKED]);
        this.spriteButtonMap.set('b', [SpriteResources.B, SpriteResources.B_CLICKED]);
        this.spriteButtonMap.set('up', [SpriteResources.UP, SpriteResources.UP_CLICKED]);
        this.spriteButtonMap.set('down', [SpriteResources.DOWN, SpriteResources.DOWN_CLICKED]);
        this.spriteButtonMap.set('left', [SpriteResources.LEFT, SpriteResources.LEFT_CLICKED]);
        this.spriteButtonMap.set('right', [SpriteResources.RIGHT, SpriteResources.RIGHT_CLICKED]);
    }
}