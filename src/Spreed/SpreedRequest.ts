// NOTE(andrews): This file is responsible for defining the data types
// you should expect to send to the Spreed server.
import {
    SpreedMessageHello,
    SpreedMessageOffer,
    SpreedMessageAnswer,
    SpreedMessageCandidate,
    SpreedMessageChat
} from './SpreedMessage';

// NOTE(andrews): SpreedRequest is the type that actually gets
// sent to the Spreed server. It is a discriminated union type.
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html
// for more information on Discriminated Union types.
export type SpreedRequest =
    SpreedRequestHello |
    SpreedRequestOffer |
    SpreedRequestAnswer |
    SpreedRequestCandidate |
    SpreedRequestChat;

// NOTE(andrews): SpreedRequestMessage defines all of the possible
// message types that can be sent to the server.
export type SpreedRequestMessage =
    SpreedMessageHello |
    SpreedMessageOffer |
    SpreedMessageAnswer |
    SpreedMessageCandidate |
    SpreedMessageChat;

export interface SpreedRequestHello {
    Type: 'Hello';
    Hello: SpreedMessageHello;
}

export interface SpreedRequestOffer {
    Type: 'Offer';
    Offer: SpreedMessageOffer;
}

export interface SpreedRequestAnswer {
    Type: 'Answer';
    Answer: SpreedMessageAnswer;
}

export interface SpreedRequestCandidate {
    Type: 'Candidate';
    Candidate: SpreedMessageCandidate;
}

export interface SpreedRequestChat {
    Type: 'Chat';
    Chat: SpreedMessageChat;
}
