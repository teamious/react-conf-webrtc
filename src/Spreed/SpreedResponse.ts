// NOTE(andrews): This file is responsible for exporting
// the data types that you can expect to receive from the SpreedServer.
import {
    SpreedUserID,
    SpreedMessageSelf,
    SpreedMessageOffer,
    SpreedMessageWelcome,
    SpreedMessageLeft,
    SpreedMessageBye,
    SpreedMessageJoined,
    SpreedMessageStatus,
    SpreedMessageAnswer,
    SpreedMessageConference,
    SpreedMessageCandidate,
    SpreedMessageChat,
    SpreedMessageError,
} from './SpreedMessage';

// NOTE(andrews): SpreedResponse represents any message sent from the Spreed WSS.
// The Data member contains the type of event as well as the relevant payload.
export interface SpreedResponse {
    Data: SpreedResponseData;
    From?: SpreedUserID;
    To?: SpreedUserID;
    Iid?: string;
    A?: string;
}

// NOTE(andrews): SpreedResponseData is a discriminated union type.
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html
// for more information on Discriminated Union types.
export type SpreedResponseData =
SpreedMessageSelf |
SpreedMessageOffer |
SpreedMessageWelcome |
SpreedMessageLeft |
SpreedMessageBye |
SpreedMessageJoined |
SpreedMessageStatus |
SpreedMessageAnswer |
SpreedMessageConference |
SpreedMessageCandidate |
SpreedMessageChat |
SpreedMessageError;
