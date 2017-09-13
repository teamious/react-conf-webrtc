import { IConfOutgoingMessage, IConfIncomingMessage } from './ConferenceMessage';

// NOTE(andrews): ConferenceConnection is an interface that your connection object
// must satisfy. The Conference component will depend on this interface when it calls
// the createConnection API.
export interface ConferenceConnection {
    subscribe: (subscriber: ConferenceConnectionSubscriber) => void;
    publish: (message: IConfOutgoingMessage) => void;
    close: () => void;
}

export interface ConferenceConnectionSubscriber {
    (message: IConfIncomingMessage): void;
}
