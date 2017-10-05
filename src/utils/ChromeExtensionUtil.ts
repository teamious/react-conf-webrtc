import { Promise } from 'es6-promise';
import * as broswer from 'bowser';
import * as Message from 'screen-capture-chrome-extension';

const IsExtensionAvailableTimeout = 1000; // 1000 MS

export class ChromeExtension {
    private callbackRegistry: { [id: string]: { resolve: (value?: any) => void, reject: (error: any) => void } } = {};
    private count: number = 0;

    public static Instance = new ChromeExtension();

    private constructor() {
        this.onMessage = this.onMessage.bind(this);
        window.addEventListener('message', this.onMessage);
    }

    public isChrome() {
        return broswer.chrome;
    }

    public isExtensionAvailable(): Promise<boolean> {
        const { msg, promise } = this.call(Message.types.extLoaded);
        window.setTimeout(() => {
            const handler = this.callbackRegistry[msg.id];
            if (handler) {
                delete this.callbackRegistry[msg.id];
                handler.resolve(false);
            }
        }, IsExtensionAvailableTimeout)
        return promise;
    }

    public getShareScreenId(): Promise<string> {
        const { msg, promise } = this.call(Message.types.getScreenSourceId);
        return promise;
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

        return {
            msg,
            promise
        };
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
        const handler = this.callbackRegistry[msg.id];
        if (!handler) {
            return;
        }

        delete this.callbackRegistry[msg.id];

        switch (msg.type) {
            case Message.types.extLoaded:
                handler.resolve(true);
                break;
            case Message.types.getScreenSourceId:
                if (msg.error) {
                    handler.reject(msg.error);
                }
                else {
                    handler.resolve(msg.data);
                }
                break;
            default:
                console.warn('unknown message', msg);
                break;
        }
    }
}
