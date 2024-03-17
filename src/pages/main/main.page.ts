import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild, afterNextRender } from "@angular/core";
import { startGame } from "src/shared";

import { SpriteButtonWidget } from "src/widgets";

@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    standalone: true,
    imports: [
        CommonModule,
        SpriteButtonWidget
    ]
})
export class MainPage {

    @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>; 

    constructor() { 
        afterNextRender(() => {
            const canvas = this.canvas?.nativeElement;
            if (!canvas) return;
            startGame(canvas);
        });
    }
}