import { IConfOutgoingMessage, IConfIncomingMessage } from './ConferenceMessage';

// NOTE(andrews): ConferenceConnection is an interface that your connection object
// must satisfy. The Conference component will depend on this interface when it calls
// the createConnection API.
export interface IConferenceConnection {
    subscribe: (subscriber: ConferenceConnectionSubscriber) => void;
    publish: (message: IConfOutgoingMessage) => void;
    close: () => void;
}

export interface IConnection {
    connect: (url: string) => void;
    onmessage: (message: any) => void;
    send: (message: any) => void;
    close: () => void;
}

export interface IMessageAdapter {
    translateIncomingMessage: (message: any) => IConfIncomingMessage[] | IConfIncomingMessage | undefined;
    translateOutgoingMessage: (message: IConfOutgoingMessage) => any;
}

export interface ConferenceConnectionSubscriber {
    (message: IConfIncomingMessage): void;
}

export interface MessageHandler {
    (message: any, done: () => void): void
}

// ConferenceConnection class is responsible for controlling the communication
// between the IConnection and IMessageAdapter instances. It exposes an API
// for subscribers to hook into the IConnection event stream. This means
// that anytime the server sends a message to the IConnection, you
// can be notified.
export class ConferenceConnection implements IConferenceConnection {
    private conn: IConnection;
    private adapter: IMessageAdapter;
    private conferenceMessageHandler?: ConferenceConnectionSubscriber;
    private onConnMessageHandler?: MessageHandler;
    private incomingMessages: IConfIncomingMessage[] = [];

    constructor(url: string, conn: IConnection, adapter: IMessageAdapter) {
        this.conn = conn;
        this.conn.connect(url);
        this.adapter = adapter;

        this.conn.onmessage = (msg) => {
            if (this.onConnMessageHandler) {
                this.onConnMessageHandler(msg, () => {
                    this.handleIncomingMessage(msg);
                })
                return
            }
            this.handleIncomingMessage(msg);
        }
    }

    public subscribe(handler: ConferenceConnectionSubscriber) {
        this.conferenceMessageHandler = handler;
        this.processIncomingMessages();
    }

    public publish(msg: IConfOutgoingMessage) {
        const outgoingMessage = this.adapter.translateOutgoingMessage(msg);
        if (!outgoingMessage) {
            console.log('handleConferenceMessage(): No translation was found for IConfOutgoingMessage type: %s', msg.type);
            return;
        }
        this.conn.send(outgoingMessage);
    }

    // NOTE(andrews): Use this API if you want to subscribe to the incoming event
    // stream from the SpreedConnection class. Note that done() must be called
    // by your handler if you want the message to continue through to the
    // connection.
    set onconnmessage(handler: MessageHandler) {
        this.onConnMessageHandler = handler;
    }

    private handleIncomingMessage(msg: any) {
        const incomingMessage = this.adapter.translateIncomingMessage(msg);

        if (!incomingMessage) {
            return;
        }

        if (incomingMessage instanceof Array) {
            incomingMessage.forEach(m => {
                this.notifyConferenceMessage(m);
            });
        }
        else {
            this.notifyConferenceMessage(incomingMessage);
        }
    }

    private notifyConferenceMessage(msg: IConfIncomingMessage) {
        if (this.conferenceMessageHandler) {
            this.conferenceMessageHandler(msg);
            return
        }
        this.incomingMessages.push(msg);
    }

    // NOTE(andrews): processIncomingMessages will process all of the queued conference messages.
    // If no handler is defined this function will return before attempting to process the queue.
    private processIncomingMessages() {
        if (!this.conferenceMessageHandler) {
            return;
        }
        while (this.incomingMessages.length > 0) {
            const message = this.incomingMessages.shift();
            if (!message) {
                console.warn('processIncomingMessages(): undefined message in queue');
                continue
            }
            this.conferenceMessageHandler(message);
        }
    }

    public close() {
        this.conn.close()
    }
}
