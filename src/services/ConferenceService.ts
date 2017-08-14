import {
    IConfMessageJoin,
    IConfOutgoingMessageCandidate,
    IConfOutgoingMessageOffer,
    IConfOutgoingMessageAnswer,
    IConfMessageBye
} from '../data';

export function createOutgoingMessageJoin(room: string): IConfMessageJoin {
    return {
        type: 'Join',
        room: room,
    }
}

export function createOutgoingMessageCandidate(candidate: RTCIceCandidateInit, id: string): IConfOutgoingMessageCandidate {
    return {
        type: 'Candidate',
        candidate: candidate,
        to: id,
    }
}

export function createOutgoingMessageOffer(sessionDescription: RTCSessionDescriptionInit, id: string): IConfOutgoingMessageOffer {
    return {
        type: 'Offer',
        sessionDescription: sessionDescription,
        to: id,
    }
}

export function createOutgoingMessageAnswer(sessionDescription: RTCSessionDescriptionInit, id: string): IConfOutgoingMessageAnswer {
    return {
        type: 'Answer',
        sessionDescription: sessionDescription,
        to: id,
    }
}

export function createOutgoingMessageBye(): IConfMessageBye {
    return {
        type: 'Bye',
    }
}
