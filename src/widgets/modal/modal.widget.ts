import { Component } from "@angular/core";

import { ModalEntity } from "src/entities";
import { ModalController } from "src/features";

@Component({
    selector: 'app-modal-widget',
    templateUrl: './modal.widget.html',
    standalone: true,
    imports: [
        ModalEntity
    ]
})
export class ModalWidget {

    constructor(
        
    ) { }
}