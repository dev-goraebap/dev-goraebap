import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

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
    aButtonClicked = false;
    bButtonClicked = false;
    upButtonClicked = false;
}