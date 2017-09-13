import { Promise } from 'es6-promise';

export class ChromeExtension {
    private callResolve: (value?: any) => void;
    constructor() {
        this.onMessage = this.onMessage.bind(this);
        window.addEventListener('message', this.onMessage);
    }

    public call(msg: string) {
        const promise = new Promise((resolve: (value?: any) => void, reject: (error: any) => void) => {
            this.callResolve = resolve;
            window.postMessage(msg, '*');
        });

        return promise;
    }

    public dispose() {
        window.removeEventListener('message', this.onMessage);
    }

    private onMessage(event: any) {
        if (event.origin != window.location.origin) {
            return;
        }

        const data = event.data;
        if (data.sourceId && this.callResolve) {
            this.callResolve(data.sourceId);
        }
    }
}
