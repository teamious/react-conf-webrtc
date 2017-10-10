import { SpreedICECandidate } from './SpreedMessage';
import {
    createCandidateRequest,
    createOfferRequest,
    createAnswerRequest,
    createHelloRequest,
} from './SpreedAPI';
import {
    IConfOutgoingMessage,
    IConfOutgoingMessageCandidate,
    IConfOutgoingMessageOffer,
    IConfOutgoingMessageAnswer,
    IConfMessageJoin,
} from '../data/ConferenceMessage';
import {
    SpreedRequest,
    SpreedRequestCandidate,
    SpreedRequestOffer,
    SpreedRequestAnswer,
    SpreedRequestHello,
} from './SpreedRequest'

// NOTE(andrews): TranslateConferenceMessage delegates the work of translating the message
// to individual functions based on the message type. Not all message types need to be translated
// into an IConfIncomingMessage. In such cases, this function will return undefined.
// TODO(andrews): Figure out if we need to handle "Bye" message / or if it's necessary
export function TranslateConferenceMessage(message: IConfOutgoingMessage): SpreedRequest | undefined {
    switch (message.type) {
        case 'Join':
            return translateJoinMessage(message);
        case 'Answer':
            return translateAnswerMessage(message);
        case 'Offer':
            return translateOfferMessage(message);
        case 'Candidate':
            return translateCandidateMessage(message);
        default:
            console.log('TranslateConferenceMessag(): Messge type not handled: %s.', message.type);
            return;
    }
}

function translateJoinMessage(message: IConfMessageJoin): SpreedRequestHello {
     // TODO(andrews): Determine if we really need Version, UA properties.
     // NOTE(yunsi): Name value in the hello message determins which room the user eventually join.
    return createHelloRequest({
        Type: 'Conference',
        Name: message.room,
        Version: '',
        Ua: '',
    })
}

function translateAnswerMessage(message: IConfOutgoingMessageAnswer): SpreedRequestAnswer {
    return createAnswerRequest({
        Type: 'Answer',
        Answer: message.sessionDescription,
        To: message.to,
    })
}

function translateOfferMessage(message: IConfOutgoingMessageOffer): SpreedRequestOffer {
    return createOfferRequest({
        Type: 'Offer',
        Offer: message.sessionDescription,
        To: message.to,
    })
}

function translateCandidateMessage(message: IConfOutgoingMessageCandidate): SpreedRequestCandidate {
    const Candidate: SpreedICECandidate = {
        ...message.candidate,
        type: 'candidate',
    }
    return createCandidateRequest({
        Type: 'Candidate',
        To: message.to,
        Candidate,
    });
}
