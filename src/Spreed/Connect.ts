import { ConferenceConnection, ConferenceConnectionSubscriber } from '../data/ConferenceConnection';
import { IConfIncomingMessage, IConfOutgoingMessage } from '../data/ConferenceMessage';
import { SpreedConnection } from './SpreedConnection';
import { SpreedAdapter } from './SpreedAdapter';
import { SpreedResponse } from '../Spreed';

export function Connect(url: string): Connection {
    return new Connection(url);
}

// NOTE(andrews): Connection class is responsible for controlling the communication
// between the SpreedConnection and SpreedAdapter instances. It exposes an API
// for subscribers to hook into the SpreedConnection event stream. This means
// that anytime the SpreedServer sends a message to the SpreedConnection, you
// can be notified.
export class Connection implements ConferenceConnection {
    private conn: SpreedConnection;
    private adapter: SpreedAdapter;
    private connSubscriber?: SpreedConnectionSubscriber;

    constructor(url: string) {
        this.conn = new SpreedConnection(url);
        this.adapter = new SpreedAdapter();
        this.conn.onmessage = (msg) => {
            if (this.connSubscriber) {
                this.connSubscriber(msg, () => {
                    this.adapter.handleSpreedMessage(msg);
                })
                return
            }
            this.adapter.handleSpreedMessage(msg);
        }
        this.adapter.onSpreedMessage = (msg) => {
            this.conn.send(msg);
        }
    }

    // NOTE(andrews): Use this API if you want to subscribe to the incoming event
    // stream from the SpreedConnection class. Note that done() must be called
    // by your handler if you want the message to continue through to the
    // connection.
    set onconnmessage(handler: SpreedConnectionSubscriber) {
        this.connSubscriber = handler;
    }

    public subscribe(handler: ConferenceConnectionSubscriber) {
        this.adapter.onConferenceMessage = (msg) => {
            handler(msg);
        }
    }

    public publish(msg: IConfOutgoingMessage) {
        this.adapter.handleConferenceMessage(msg);
    }
}

export interface SpreedConnectionSubscriber {
    (message: SpreedResponse, done: () => void): void
}
