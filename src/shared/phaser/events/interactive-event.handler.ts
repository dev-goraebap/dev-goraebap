import { BehaviorSubject, filter } from "rxjs";
import { InteractiveType } from "../prefabs";

export class InteractiveEventHandler {

    private static _instance: InteractiveEventHandler;

    private readonly _events$ = new BehaviorSubject<InteractiveType|null>(null);

    private constructor() { 
        console.log('생성됨');
    }

    get events$() {
        return this._events$.asObservable().pipe(
            filter((eventType) => eventType!== null)
        );
    }

    get finished$() {
        return this._events$.asObservable().pipe(
            filter((eventType) => eventType === null)
        );
    }

    static getInstance() {
        if (!InteractiveEventHandler._instance) {
            InteractiveEventHandler._instance = new InteractiveEventHandler();
        }

        return InteractiveEventHandler._instance;
    }

    publish(eventType: InteractiveType) {
        this._events$.next(eventType);
    }

    clear() {
        this._events$.next(null);
    }
}