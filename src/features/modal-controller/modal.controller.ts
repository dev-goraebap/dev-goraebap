import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

@Injectable()
export class ModalController {

    private readonly _state$ = new BehaviorSubject<boolean>(false);

    open() {
        this._state$.next(true);
    }

    close() {
        this._state$.next(false);
    }
}