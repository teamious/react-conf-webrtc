// NOTE(andrews): This file is responsible for export the contract for talking to the Spreed
// API.
import {
    SpreedRequestOffer,
    SpreedRequestAnswer,
    SpreedRequestCandidate,
    SpreedRequestHello,
    SpreedRequestChat,
} from './SpreedRequest';

import {
    SpreedMessageOffer,
    SpreedMessageAnswer,
    SpreedMessageCandidate,
    SpreedMessageHello,
    SpreedMessageChat,
} from './SpreedMessage';

export function createOfferRequest(Offer: SpreedMessageOffer): SpreedRequestOffer {
    return {
        Type: 'Offer',
        Offer,
    }
}

export function createAnswerRequest(Answer: SpreedMessageAnswer): SpreedRequestAnswer {
    return {
        Type: 'Answer',
        Answer,
    }
}

export function createCandidateRequest(Candidate: SpreedMessageCandidate): SpreedRequestCandidate {
    return {
        Type: 'Candidate',
        Candidate,
    }
}

export function createHelloRequest(Hello: SpreedMessageHello): SpreedRequestHello {
    return {
        Type: 'Hello',
        Hello,
    }
}

export function createChatRequest(Chat: SpreedMessageChat): SpreedRequestChat {
    return {
        Type: 'Chat',
        Chat
    }
}
