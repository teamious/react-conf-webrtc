import { Promise } from 'es6-promise';
import * as Message from '../../screen-capture-chrome-extension/src/message';

export class ChromeExtension {
    private callbackRegistry: { [id: string]: { resolve: (value?: any) => void, reject: (error: any) => void } } = {};
    private count: number = 0;

    public static Instance = new ChromeExtension();

    private constructor() {
        this.onMessage = this.onMessage.bind(this);
        window.addEventListener('message', this.onMessage);
    }

    public isExtensionAvailable(): Promise<boolean> {
        return this.call(Message.types.extLoaded);
    }

    public getShareScreenId(): Promise<string> {
        return this.call(Message.types.getScreenSourceId);
    }

    public dispose() {
        window.removeEventListener('message', this.onMessage);
    }

    private call(type: string, data?: any) {
        const msg: Message.IMessage = {
            type,
            data,
            action: Message.actions.call,
            id: this.count++
        }

        const promise = new Promise((resolve: (value?: any) => void, reject: (error: any) => void) => {
            this.callbackRegistry[msg.id] = { resolve, reject };
            window.postMessage(msg, '*');
        });

        return promise;
    }

    private onMessage(event: any) {
        if (event.origin != window.location.origin) {
            return;
        }

        const msg: Message.IMessage = event.data;
        if (!Message.isWellKnownMessage(msg)) {
            // Unknown message
            return;
        }

        if (msg.action === Message.actions.call) {
            // Ignore call message.
            return;
        }
        else if (msg.action === Message.actions.answer) {
            this.handleMsg(msg);
        }
        else {
            console.log('unknown message', msg);
        }
    }

    private handleMsg(msg: Message.IMessage) {
        if (!this.callbackRegistry[msg.id]) {
            return;
        }

        switch (msg.type) {
            case Message.types.extLoaded:
                this.callbackRegistry[msg.id].resolve(true);
                break;
            case Message.types.getScreenSourceId:
                if (msg.error) {
                    this.callbackRegistry[msg.id].reject(msg.error);
                }
                else {
                    this.callbackRegistry[msg.id].resolve(msg.data);
                }
                break;
            default:
                console.warn('unknown message', msg);
                break;
        }
    }
}
