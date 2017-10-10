import { ConferenceConnection } from '../data/ConferenceConnection';
import { IConfIncomingMessage, IConfOutgoingMessage } from '../data/ConferenceMessage';
import { SpreedConnection } from './SpreedConnection';
import { SpreedAdapter } from './SpreedAdapter';
import { SpreedResponse } from '../Spreed';

export function SpreedConnect(url: string): SpreedConferenceConnection {
    return new SpreedConferenceConnection(url);
}

// NOTE(andrews): Connection class is responsible for controlling the communication
// between the SpreedConnection and SpreedAdapter instances. It exposes an API
// for subscribers to hook into the SpreedConnection event stream. This means
// that anytime the SpreedServer sends a message to the SpreedConnection, you
// can be notified.
export class SpreedConferenceConnection extends ConferenceConnection {
    constructor(url: string) {
        super(url, new SpreedConnection(), new SpreedAdapter())
    }
}

export interface SpreedConnectionMessageHandler {
    (message: SpreedResponse, done: () => void): void
}
