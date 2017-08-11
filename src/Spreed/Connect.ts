import { ConferenceConnection, ConferenceConnectionSubscriber } from '../data/ConferenceConnection';
import { IConfIncomingMessage, IConfOutgoingMessage } from '../data/ConferenceMessage';
import { SpreedConnection } from './SpreedConnection';
import { SpreedAdapter } from './SpreedAdapter';

export function Connect(url: string): ConferenceConnection {
    return new Connection(url);
}

// NOTE(andrews): Connection
class Connection implements ConferenceConnection {
    private conn: SpreedConnection;
    private adapter: SpreedAdapter;

    constructor(url: string) {
        this.conn = new SpreedConnection(url);
        this.adapter = new SpreedAdapter();
        this.conn.onmessage = (msg) => {
            this.adapter.handleSpreedMessage(msg);
        }
        this.adapter.onSpreedMessage = (msg) => {
            this.conn.send(msg);
        }
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
