import { SpreedResponse } from './SpreedResponse';
import {
    IConfIncomingMessage,
    IConfIncomingMessageOffer,
    IConfIncomingMessageAnswer,
    IConfIncomingMessageCandidate,
    IConfMessageAddPeer,
    IConfMessageRemovePeer,
} from '../data/ConferenceMessage'
import {
    SpreedMessageOffer,
    SpreedMessageAnswer,
    SpreedMessageCandidate,
    SpreedMessageJoined,
    SpreedMessageLeft,
} from './SpreedMessage';

// NOTE(andrews): TranslateSpreedMessage delegates the work of translating the message
// to individual functions based on the message type. Not all message types need to be translated
// into an IConfIncomingMessage. In such cases, this function will return undefined.
export function TranslateSpreedMessage(message: SpreedResponse): IConfIncomingMessage | undefined {
    switch (message.Data.Type) {
        case 'Offer':
            return translateOfferMessage(message.Data, message)
        case 'Answer':
            return translateAnswerMessage(message.Data, message);
        case 'Candidate':
            return translateCandidateMessage(message.Data, message);
        case 'Joined':
            return translateJoinedMessage(message.Data, message);
        case 'Left':
            return translateLeftMessage(message.Data, message);
        default:
            return undefined;
    }
}

function translateLeftMessage(data: SpreedMessageLeft, message: SpreedResponse): IConfMessageRemovePeer | undefined {
    return {
        type: 'RemovePeer',
        Id: data.Id,
    }
}

function translateJoinedMessage(data: SpreedMessageJoined, message: SpreedResponse): IConfMessageAddPeer | undefined {
    return {
        type: 'AddPeer',
        Id: data.Id,
    }
}

function translateCandidateMessage(data: SpreedMessageCandidate, message: SpreedResponse): IConfIncomingMessageCandidate | undefined {
    if (!message.From) {
        console.warn('translateCandidateMessage(): Failed to translate "Candidate" message. "From" member not found.')
        return;
    }
    return {
        type: 'Candidate',
        candidate: data.Candidate,
        from: message.From,
    }
}

function translateAnswerMessage(data: SpreedMessageAnswer, message: SpreedResponse): IConfIncomingMessageAnswer | undefined {
    if (!message.From) {
        console.warn('translateAnswerMessage(): Failed to translate "Answer" message. "From" member not found.')
        return;
    }
    return {
        type: 'Answer',
        sessionDescription: data.Answer,
        from: message.From,
    }
}

function translateOfferMessage(data: SpreedMessageOffer, message: SpreedResponse): IConfIncomingMessageOffer | undefined {
    if (!message.From) {
        console.warn('translateOfferMessage(): Failed to translate "Offer" message. "From" member not found.')
        return;
    }
    return {
        type: 'Offer',
        sessionDescription: data.Offer,
        from: message.From,
    }
}
