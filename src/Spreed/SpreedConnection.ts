import { SpreedResponse } from './SpreedResponse';
import { SpreedRequest } from './SpreedRequest';

// NOTE(andrews): SpreedConnection is a wrapper around the WebSocket connection.
// It will queue any responses (messages from the server) and requests (messages from the client)
// if no receiver is ready. Messages from the server are processed once an `onmessage` handler is assigned.
// Likewise, messages from the client are only processed once the WebSocket connection is open.
export class SpreedConnection {
    private conn: WebSocket;
    private onMessageHandler: SpreedResponseHandler;
    // queue of server -> client messages
    private responses: SpreedResponse[] = [];
    // queue of client -> server messages
    private requests: SpreedRequest[] = [];

    constructor(url: string) {
        this.conn = new WebSocket(url);
        this.conn.onmessage = this.onConnMessage.bind(this);
        this.conn.onclose = this.onConnClose.bind(this);
        this.conn.onerror = this.onConnError.bind(this);
        this.conn.onopen = this.onConnOpen.bind(this);
    }

    private onConnOpen() {
        this.processResponses();
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
        while (this.responses.length > 0) {
            const req = this.requests.shift();
            if (req) {
                this.send(req);
            }
        }
    }

    private onConnError(event: Event) {
        // TODO(andrews): Figure out how to handle connection error.
    }

    private onConnClose(event: CloseEvent) {
        // TODO(andrews): Figure out how to handle closed connections.
    }

    private send(message: SpreedRequest) {
        if (this.hasOpenConnection()) {
            this.conn.send(JSON.stringify(message));
        }
        this.requests.push(message);
    }

    private hasOpenConnection() {
        this.conn.readyState === this.conn.OPEN;
    }

    private onConnMessage(event: MessageEvent) {
        const message: SpreedResponse = JSON.parse(event.data);
        if (this.onMessageHandler) {
            this.onMessageHandler(message);
            return
        }
        this.responses.push(message);
    }

    set onmessage(handler: SpreedResponseHandler) {
        this.onMessageHandler = handler;
        this.processResponses();
    }
}

export interface SpreedResponseHandler {
    (message: SpreedResponse): void;
}