import { IConnection } from '../data/';
import { SpreedResponse } from './SpreedResponse';
import { SpreedRequest } from './SpreedRequest';

// NOTE(andrews): SpreedConnection is a wrapper around the WebSocket connection.
// It will queue any responses (messages from the server) and requests (messages from the client)
// if no receiver is ready. Messages from the server are processed once an `onmessage` handler is assigned.
// Likewise, messages from the client are only processed once the WebSocket connection is open.
export class SpreedConnection implements IConnection {
    private conn: WebSocket;
    private onCloseHandler: SpreedConnCloseHandler;
    private onErrorHandler: SpreedConnErrorHandler;
    private onMessageHandler: SpreedResponseHandler;
    // queue of server -> client messages
    private responses: SpreedResponse[] = [];
    // queue of client -> server messages
    private requests: SpreedRequest[] = [];

    public connect(url: string) {
        this.conn = new WebSocket(url);
        this.conn.onmessage = this.onConnMessage.bind(this);
        this.conn.onclose = this.onConnClose.bind(this);
        this.conn.onerror = this.onConnError.bind(this);
        this.conn.onopen = this.onConnOpen.bind(this);
    }

    private onConnOpen() {
        this.processRequests();
    }

    private processResponses() {
        while (this.responses.length > 0) {
            const res = this.responses.shift();
            if (res) {
                this.onMessageHandler(res);
            }
        }
    }

    private processRequests() {
        while (this.requests.length > 0) {
            const req = this.requests.shift();
            if (req) {
                this.send(req);
            }
        }
    }

    private onConnError(event: Event) {
        if (this.onErrorHandler) {
            this.onErrorHandler(event);
        }
    }

    private onConnClose(event: CloseEvent) {
        if (this.onCloseHandler) {
            this.onCloseHandler(event);
        }
    }

    // NOTE(andrews): send is used to send messages to the WebSocket connection.
    // It expects that any message being is a SpreedRequest type. If the connection
    // is not open, this function will queue the requests in the this.requests array.
    public send(message: SpreedRequest) {
        if (this.hasOpenConnection()) {
            this.conn.send(JSON.stringify(message));
            return
        }
        this.requests.push(message);
    }

    public close() {
        this.conn.close()
    }

    private hasOpenConnection(): boolean {
        return this.conn.readyState === this.conn.OPEN;
    }

    // NOTE(andrews): onConnMessage is called whenever the WebSocket connection
    // receives a MessageEvent. It parses the message from the server and
    // sends it to the function assigned via the onmessage setter. If no
    // function has been set, it will queue the message in the this.responses array.
    private onConnMessage(event: MessageEvent) {
        const message: SpreedResponse = JSON.parse(event.data);
        if (this.onMessageHandler) {
            this.onMessageHandler(message);
            return
        }
        this.responses.push(message);
    }

    // NOTE(andrews): onmessage is a setter for the class that you can use to subscribe
    // to any messages that the connection received. If there are any queued messages, they
    // will be processed immediately.
    set onmessage(handler: SpreedResponseHandler) {
        this.onMessageHandler = handler;
        this.processResponses();
    }

    set onclose(handler: SpreedConnCloseHandler) {
        this.onCloseHandler = handler;
    }

    set onerror(handler: SpreedConnErrorHandler) {
        this.onErrorHandler = handler;
    }
}

export interface SpreedResponseHandler {
    (message: SpreedResponse): void;
}

export interface SpreedConnCloseHandler {
    (event: CloseEvent): any;
}

export interface SpreedConnErrorHandler {
    (event: Event): any;
}
