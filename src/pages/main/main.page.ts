import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild, afterNextRender } from "@angular/core";

import { ModalWidget } from "src/widgets";
import { InteractiveEventHandler, startGame } from "src/shared";


@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    standalone: true,
    imports: [
        CommonModule,
        ModalWidget
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

        const eventHandler = InteractiveEventHandler.getInstance();
        eventHandler.events$.subscribe((eventType) => {
            console.log(eventType);
        });

        setTimeout(() => {
            eventHandler.clear();
        }, 10000);
    }
}